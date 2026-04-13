import { pool } from "../../config/db";

interface VehiclePayload {
  vehicle_name: string;
  type: string;
  registration_number: string;
  daily_rent_price: number;
  availability_status: 'available' | 'booked';
}

const createVehicle = async (payload: VehiclePayload) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;
  const result = await pool.query(
    `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [vehicle_name, type, registration_number, daily_rent_price, availability_status]
  );
  return result;
};

const getAllVehicles = async () => {
  return await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
};

const getAvehicle = async (vehicleId: number) => {
  return await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
};

const updateVehicle = async (vehicleId: number, payload: VehiclePayload) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;
  const current = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [vehicleId]);
  const vehicle = current.rows[0];
  if (!vehicle) {
  throw new Error(`Vehicle with id ${vehicleId} not found`);
}
  const updatedName         = vehicle_name         ?? vehicle.vehicle_name;
  const updatedType         = type                 ?? vehicle.type;
  const updatedRegNumber    = registration_number  ?? vehicle.registration_number;
  const updatedDailyRent    = daily_rent_price     ?? vehicle.daily_rent_price;
  const updatedAvailability = availability_status  ?? vehicle.availability_status;

  const query = `
    UPDATE vehicles 
    SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5
    WHERE id=$6
    RETURNING *;
  `;

  const result = await pool.query(query, [
    updatedName,
    updatedType,
    updatedRegNumber,
    updatedDailyRent,
    updatedAvailability,
    vehicleId
  ]);

  return result;
};

const deleteVehicle = async (vehicleId: number) => {
  const bookingCheck = await pool.query(
    "SELECT id FROM bookings WHERE vehicle_id = $1 AND status NOT IN ('returned', 'cancelled')",
    [vehicleId]
  );

  if (bookingCheck.rows.length > 0) {
    throw new Error("ACTIVE_BOOKINGS");
  }

  return await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [vehicleId]);
};

export const vehicleServices = {
  createVehicle,
  getAllVehicles,
  getAvehicle,
  updateVehicle,
  deleteVehicle
};