import { Router } from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middleware/auth";
import { Roles } from "../auth/auth.constant";

const router = Router();

router.get('/', auth(Roles.ADMIN, Roles.CUSTOMER), bookingController.getAllBookings);
router.post('/', auth(Roles.ADMIN, Roles.CUSTOMER), bookingController.createBooking);
router.put('/:bookingId', auth(Roles.ADMIN), bookingController.updateVehicle);

export const bookingRoute = router;