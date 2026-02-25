import { pool } from "../../config/db";

interface VehiclePayload {
  vehicle_name: string;
  type: string;
  registration_number: string;
  daily_rent_price: number;
  availability_status: boolean;
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
  const query = `
    UPDATE vehicles 
    SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5
    WHERE id = $6
    RETURNING *;
  `;
  return await pool.query(query, [vehicle_name, type, registration_number, daily_rent_price, availability_status, vehicleId]);
};

const deleteVehicle = async (vehicleId: number) => {
  const bookingCheck = await pool.query(
    "SELECT id FROM bookings WHERE vehicle_id = $1 AND status NOT IN ('completed', 'cancelled')",
    [vehicleId]
  );

  if (bookingCheck.rows.length > 0) {
    throw new Error("ACTIVE_BOOKINGS");
  }

  return await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [vehicleId]);
};

export const vehiclesService = {
  createVehicle,
  getAllVehicles,
  getAvehicle,
  updateVehicle,
  deleteVehicle
};