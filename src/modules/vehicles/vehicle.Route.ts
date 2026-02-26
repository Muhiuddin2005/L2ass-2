import express from "express";
import { vehicleControllers } from "./vehicle.Controller";
import auth from "../../middleware/auth";

const router = express.Router();

router.post('/',auth("admin"), vehicleControllers.createVehicle);
router.get('/', vehicleControllers.getAllVehicles);
router.get('/:vehicleId', vehicleControllers.getAvehicle);
router.put('/:vehicleId',auth("admin"), vehicleControllers.updateVehicle);
router.delete('/:vehicleId',auth("admin"), vehicleControllers.deleteVehicle);

export const vehiclesRouter = router;