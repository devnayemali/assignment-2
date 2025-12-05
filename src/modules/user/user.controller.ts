import { Request, Response } from "express";
import { userService } from "./user.service";

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

        await userService.getUserById(userId as string);

        const updateVehicle = await userService.updateUser(userId as string, req.body);

        delete updateVehicle.password;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updateVehicle
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
    updateUser
}