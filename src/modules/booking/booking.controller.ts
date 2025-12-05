import { Request, Response } from "express";
import { bookingService } from "./booking.service";
import { userService } from "../user/user.service";
import { vehicleService } from "../vehicle/vehicle.service";
import { Roles } from "../auth/auth.constant";

const createBooking = async (req: Request, res: Response) => {
    try {

        const { customer_id, vehicle_id } = req.body;

        await userService.getUserById(customer_id as string);

        const vehicle = await vehicleService.getVehicleById(vehicle_id as string);

        const booking = await bookingService.createBooking(req.body, vehicle);

        await vehicleService.updateVehicle(vehicle_id as string, { availability_status: "booked" });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

const getAllBookings = async (req: Request, res: Response) => {

    try {

        let bookings;
        let message = "";
        
        if (req.user!.role === Roles.CUSTOMER) {
            bookings = await bookingService.getMyBookings(req.user!.id);
            message = "Your bookings retrieved successfully";
        } else {
            bookings = await bookingService.getAllBookings();
            message = "Bookings retrieved successfully";
        }

        if (bookings.length === 0) {
            res.status(200).json({
                success: true,
                message: "No bookings found",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: message,
            data: bookings
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

}

const getSingleVehicle = async (req: Request, res: Response) => {

    try {

        const vehicle = await bookingService.getVehicleById(req.params.vehicleId as string);

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

const updateVehicle = async (req: Request, res: Response) => {

    try {

        const vehicleId = req.params.vehicleId as string;

        await bookingService.getVehicleById(vehicleId as string);

        const updateVehicle = await bookingService.updateVehicle(vehicleId as string, req.body);

        res.status(200).json({
            success: true,
            message: "Booking created successfully",
            data: updateVehicle
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

}


export const bookingController = {
    createBooking,
    getAllBookings,
    getSingleVehicle,
    updateVehicle
}