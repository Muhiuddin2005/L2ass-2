import { Request, Response } from "express";
import { userServices } from "./user.Service";

const signUp = async (req: Request, res: Response) => {
  try {
    const result = await userServices.signUp(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
    
  } catch (error: any) {
  res.status(500).json({
    success: false,
    message: error.message
  });
}
};

const signIn = async (req: Request, res: Response) => {
  try {
    const data = await userServices.signIn(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: data
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.message
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const isOwnProfile = String(req.user?.id) === String(req.params.id);
    
    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ success: false, message: "You can only update your own profile" });
    }
    
    if (!isAdmin && isOwnProfile && req.body.role) {
      return res.status(403).json({ success: false, message: "You cannot change your role" });
    }
    
    if (!isAdmin && isOwnProfile) {
      delete req.body.role;
    }
    
    const result = await userServices.updateUser(req.params.id as string, req.body, req.user?.role);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await userServices.deleteUser(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err: any) {
    const status = err.message === "ACTIVE_BOOKINGS" ? 400 : 500;
    const msg = err.message === "ACTIVE_BOOKINGS" 
      ? "User cannot be deleted because they have active bookings" 
      : err.message;
    res.status(status).json({ success: false, message: msg });
  }
};

export const userControllers = {
  signIn,
  signUp,
  getAllUsers,
  updateUser,
  deleteUser
};