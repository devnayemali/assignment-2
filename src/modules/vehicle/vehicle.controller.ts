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

const getAllVehicles = async (req: Request, res: Response) => {

    try {

        const vehicles = await vehicleService.getAllVehicles();

        if (vehicles.length === 0) {
            res.status(200).json({
                success: true,
                message: "No vehicles found",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: vehicles
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

}

const getVehicleById = async (req: Request, res: Response) => {

    try {

        const vehicle = await vehicleService.getVehicleById(req.params.vehicleId as string);

        if (!vehicle) {
            throw new Error('Vehicle not found.');
        }

        vehicle.daily_rent_price = Number(vehicle.daily_rent_price);

        res.status(200).json({
            success: true,
            message: "Vehicle retrieved successfully",
            data: vehicle
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
    getAllVehicles,
    getVehicleById
}