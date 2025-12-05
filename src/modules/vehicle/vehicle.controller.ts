import { Request, Response } from "express";
import { userService } from "../auth/user/user.service";
import { vehicleService } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
    try {

        const { registration_number } = req.body;

        const checkVehicle = await vehicleService.getVehicleByRegistrationNumber(registration_number as string);

        if (checkVehicle.rowCount === 1) {
            throw new Error('Registration number already exists.');
        }

        const vehicle = await vehicleService.createVehicle(req.body);

        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

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

export const vehicleController = {
    createVehicle,
    getAllUsers
}