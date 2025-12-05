import { Router } from "express";
import { vehicleController } from "./vehicle.controller";
import auth from "../../middleware/auth";
import { Roles } from "../auth/auth.constant";

const router = Router();

router.get('/', vehicleController.getAllVehicles);
router.post('/', auth(Roles.ADMIN), vehicleController.createVehicle);
router.get('/:vehicleId', vehicleController.getSingleVehicle);
router.put('/:vehicleId', vehicleController.updateVehicle);

export const vehicleRoute = router;