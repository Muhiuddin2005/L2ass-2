import express, { Request, Response } from "express"
import { pool } from "../../config/db";
const router=express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { 
    vehicle_name, 
    type, 
    registration_number, 
    daily_rent_price, 
    availability_status 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO vehicles (
        vehicle_name, 
        type, 
        registration_number, 
        daily_rent_price, 
        availability_status
      ) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0]
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
    const hasData = result.rows.length > 0;
    const message = hasData ? "Vehicles retrieved successfully" : "No vehicles found";
    res.status(200).json({
      success: true,
      message: message,
      data: result.rows
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

router.get('/:vehicleId', async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        data: null
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result.rows[0]
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

router.put('/:vehicleId', async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const { 
    vehicle_name, 
    type, 
    registration_number, 
    daily_rent_price, 
    availability_status 
  } = req.body;

  try {
    const query = `
      UPDATE vehicles 
      SET 
        vehicle_name = $1,
        type = $2,
        registration_number = $3,
        daily_rent_price = $4,
        availability_status = $5
      WHERE id = $6
      RETURNING *;
    `;

    const values = [
      vehicle_name, 
      type, 
      registration_number, 
      daily_rent_price, 
      availability_status, 
      vehicleId
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0]
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:vehicleId', async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const bookingCheck = await pool.query(
  "SELECT id FROM bookings WHERE vehicle_id = $1 AND status NOT IN ('completed', 'cancelled')",
  [vehicleId]
);

    if (bookingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Vehicle cannot be deleted because it has active bookings"
      });
    }
    const result = await pool.query(
      'DELETE FROM vehicles WHERE id = $1 RETURNING *',
      [vehicleId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully"
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});
export const vehiclesRouter=router;