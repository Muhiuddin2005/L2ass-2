import { Request, Response } from 'express';
import { bookingServices } from './bookings.Service';

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.createBooking(req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: number; role: string };
    const result = await bookingServices.getAllBookings(user);

    const message = user.role === 'admin' 
      ? "Bookings retrieved successfully" 
      : "Your bookings retrieved successfully";

    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const user = req.user as { id: number; role: string };
    
    const result = await bookingServices.updateBooking(bookingId as string, req.body, user);

    const message = req.body.status === 'cancelled' 
      ? "Booking cancelled successfully" 
      : "Booking marked as returned. Vehicle is now available";

    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const bookingControllers={
    createBooking,getAllBookings,updateBooking
}