import express from "express";
import { vehiclesController } from "./vehiclesController";

const router = express.Router();

router.post('/', vehiclesController.createVehicle);
router.get('/', vehiclesController.getAllVehicles);
router.get('/:vehicleId', vehiclesController.getAvehicle);
router.put('/:vehicleId', vehiclesController.updateVehicle);
router.delete('/:vehicleId', vehiclesController.deleteVehicle);

export const vehiclesRouter = router;