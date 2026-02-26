import express from "express";
import { bookingControllers } from "./bookings.Controller";
import auth from "../../middleware/auth";
const router = express.Router();

router.post("/",auth("admin", "customer"), bookingControllers.createBooking);
router.get("/", auth("admin", "customer"), bookingControllers.getAllBookings);
router.put("/:bookingId",auth("admin", "customer"),bookingControllers.updateBooking);

export const bookingRoutes = router;
