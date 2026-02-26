import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

interface UserPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'customer';
}

const signUp = async (payload: UserPayload) => {
  const { name, email, password, phone, role } = payload;

  const hashedPass = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, phone, role`,
    [name, email.toLowerCase(), hashedPass, phone, role]
  );

  return result;
};



const signIn = async (payload: UserPayload) => {
  const { email, password } = payload;
  const userResult = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = userResult.rows[0];

  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid password");
  }
  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwtSecret as string, 
    { expiresIn: "7d" }
  );

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

const getAllUsers = async () => {
  const result = await pool.query(`SELECT id, name, email, phone, role FROM users`);
  return result;
};

const updateUser = async (id: string, payload: UserPayload) => {
  const { name, email, phone, role } = payload;

  const result = await pool.query(
    `UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING id, name, email, phone, role`,
    [name, email, phone, role, id]
  );

  return result;
};

const deleteUser = async (id: string) => {
  const bookingCheck = await pool.query(
    "SELECT id FROM bookings WHERE customer_id = $1 AND status NOT IN ('returned', 'cancelled')",
    [id]
  );

  if (bookingCheck.rows.length > 0) {
    throw new Error("ACTIVE_BOOKINGS");
  }

  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  return result;
};

export const userServices = {
  signIn,
  getAllUsers,
  updateUser,
  deleteUser,
  signUp
};