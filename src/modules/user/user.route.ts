import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.get('/', userController.getAllUsers);

export const userRouter = router;