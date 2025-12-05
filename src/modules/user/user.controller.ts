import { Request, Response } from "express";
import { userService } from "./user.service";
import { Roles } from "../auth/auth.constant";
import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../database/database";

const getAllUsers = async (req: Request, res: Response) => {

    try {

        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

}

const updateUser = async (req: Request, res: Response) => {

    try {

        const userId = req.params.userId as string;
        const role = req.user!.role;
        const authUserId = req.user!.id;

        await userService.getUserById(userId as string);

        const updateUser = await userService.updateUser(userId as string, req.body, req.user as JwtPayload);
        delete updateUser.password;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updateUser
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

}


const deleteUser = async (req: Request, res: Response) => {

    try {

        const userId = req.params.userId as string;

        await userService.getUserById(userId as string);

        await userService.deleteUser(userId as string);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

}

export const userController = {
    getAllUsers,
    updateUser,
    deleteUser
}