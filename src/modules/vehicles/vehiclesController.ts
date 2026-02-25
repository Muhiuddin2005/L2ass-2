import { Request, Response } from "express";
import { vehiclesService } from "./vehiclesService";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesService.createVehicle(req.body);
    res.status(201).json({ success: true, message: "Vehicle created successfully", data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesService.getAllVehicles();
    res.status(200).json({
      success: true,
      message: result.rows.length > 0 ? "Vehicles retrieved successfully" : "No vehicles found",
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

const getAvehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesService.getAvehicle(Number(req.params.vehicleId));
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.status(200).json({ success: true, message: "Vehicle retrieved successfully", data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesService.updateVehicle(Number(req.params.vehicleId), req.body);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.status(200).json({ success: true, message: "Vehicle updated successfully", data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesService.deleteVehicle(Number(req.params.vehicleId));
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.status(200).json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error: any) {
    const status = error.message === "ACTIVE_BOOKINGS" ? 400 : 500;
    const msg = error.message === "ACTIVE_BOOKINGS" 
      ? "Vehicle cannot be deleted because it has active bookings" 
      : error.message;
    res.status(status).json({ success: false, message: msg });
  }
};

export const vehiclesController = {
  createVehicle,
  getAllVehicles,
  getAvehicle,
  updateVehicle,
  deleteVehicle
};