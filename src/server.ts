import express, { Request, Response } from 'express'
import dotenv from "dotenv"
import path from "path"

dotenv.config({path:path.join(process.cwd(),".env")})
const app = express()
const port = 3000
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString:`${process.env.CONNECTION_STR}`
});
app.use(express.json())

const createVehiclesQuery = `
  CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    daily_rent_price DECIMAL(10, 2) NOT NULL CHECK (daily_rent_price > 0),
    availability_status VARCHAR(15) DEFAULT 'available' CHECK (availability_status IN ('available', 'booked'))
  );
`;

const createUsersQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL CHECK (email = LOWER(email)),
      password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
      phone VARCHAR(20) NOT NULL,
      role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'customer'))
    );
  `;

  const createBookingsQuery = `
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
      rent_start_date DATE NOT NULL,
      rent_end_date DATE NOT NULL,
      total_price DECIMAL(12, 2) NOT NULL CHECK (total_price > 0),
      status VARCHAR(15) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'returned')),
      CONSTRAINT check_dates CHECK (rent_end_date >= rent_start_date)
    );
  `;

async function setupDatabase() {
  try {
    await pool.query(createVehiclesQuery);
    await pool.query(createUsersQuery);
    await pool.query(createBookingsQuery);
  } catch (err:any) {
    console.error("Error creating table:", err.message);
  }
}

setupDatabase();

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})
app.post('/post', (req:Request, res:Response) => {
  console.log(req.body);

  res.status(201).json(
    {
        message:"api is created!",
        success:true
    }
  )
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
