import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { Roles } from "../auth/auth.constant";

const router = Router();

router.get('/', auth(Roles.ADMIN), userController.getAllUsers);
router.put('/:userId', auth(Roles.ADMIN, Roles.CUSTOMER), userController.updateUser);
router.delete('/:userId', auth(Roles.ADMIN), userController.deleteUser);

export const userRouter = router;