import { pool } from "../../config/db";

interface BookingPayload {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}
interface BookingResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
    total_price: number;
    status: string;
    vehicle: {
      vehicle_name: string;
      daily_rent_price: number;
    };
  };
}
const createBooking = async (payload: BookingPayload) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;
  const vehicleRes = await pool.query(
    "SELECT vehicle_name, daily_rent_price FROM vehicles WHERE id = $1",
    [vehicle_id],
  );

  if (vehicleRes.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleRes.rows[0];
  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);
  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  const days = diffInDays === 0 ? 1 : diffInDays;
  const total_price = days * vehicle.daily_rent_price;
  const bookingResult = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
     VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price],
  );
  await pool.query(
    "UPDATE vehicles SET availability_status = 'booked' WHERE id = $1",
    [vehicle_id],
  );

  const booking = bookingResult.rows[0];
  const response: BookingResponse = {
    success: true,
    message: "Booking created successfully",
    data: {
      id: booking.id,
      customer_id: booking.customer_id,
      vehicle_id: booking.vehicle_id,
      rent_start_date: rent_start_date,
      rent_end_date: rent_end_date,
      total_price: parseFloat(booking.total_price),
      status: booking.status,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    },
  };

  return response;
};

const getAllBookings = async (user: { id: number; role: string }) => {
  let query: string;
  let values: any[] = [];

  if (user.role === "admin") {
    query = `
      SELECT 
        bookings.*,                     
        users.name AS customer_name,    
        users.email AS customer_email,  
        vehicles.vehicle_name,      
        vehicles.registration_number
      FROM bookings                  
      JOIN users                        
        ON bookings.customer_id = users.id 
      JOIN vehicles                     
        ON bookings.vehicle_id = vehicles.id
    `;
  } else {
    query = `
      SELECT 
        bookings.*,                  
        vehicles.vehicle_name,          
        vehicles.registration_number,  
        vehicles.type AS vehicle_type 
      FROM bookings                    
      JOIN vehicles                  
        ON bookings.vehicle_id = vehicles.id 
      WHERE bookings.customer_id = $1  
    `;
    values = [user.id];
  }
  const result = await pool.query(query, values);

  return result.rows.map((row) => ({
    id: row.id,
    customer_id: row.customer_id,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: parseFloat(row.total_price),
    status: row.status,

    ...(user.role === "admin" && {
      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },
    }),
    vehicle: {
      vehicle_name: row.vehicle_name,
      registration_number: row.registration_number,
      ...(user.role === "customer" && { type: row.vehicle_type }),
    },
  }));
};

const updateBooking = async (
  bookingId: string,
  payload: { status: string },
  user: { id: number; role: string },
) => {
  const { status } = payload;
  const findBookingQuery =
    user.role === "admin"
      ? "SELECT * FROM bookings WHERE id = $1"
      : "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2";

  const findBookingValues =
    user.role === "admin" ? [bookingId] : [bookingId, user.id];
  const bookingCheck = await pool.query(findBookingQuery, findBookingValues);

  if (bookingCheck.rowCount === 0) {
    throw new Error("Booking not found or unauthorized");
  }

  const booking = bookingCheck.rows[0];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updateBookingRes = await client.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, bookingId],
    );

    let vehicleUpdate = null;
    if (status === "cancelled" || status === "returned") {
      const vehicleRes = await client.query(
        "UPDATE vehicles SET availability_status = 'available' WHERE id = $1 RETURNING availability_status",
        [booking.vehicle_id],
      );
      vehicleUpdate = vehicleRes.rows[0];
    }

    await client.query("COMMIT");

    const updatedBooking = updateBookingRes.rows[0];
    return {
      ...updatedBooking,
      total_price: parseFloat(updatedBooking.total_price),
      ...(status === "returned" && { vehicle: vehicleUpdate }),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const bookingServices = {
  createBooking,
  getAllBookings,
  updateBooking
};
