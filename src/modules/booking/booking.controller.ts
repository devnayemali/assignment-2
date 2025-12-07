import { Request, Response } from "express";
import { bookingService } from "./booking.service";
import { userService } from "../user/user.service";
import { vehicleService } from "../vehicle/vehicle.service";
import { Roles } from "../auth/auth.constant";
import { vehicleController } from "../vehicle/vehicle.controller";
import { JwtPayload } from "jsonwebtoken";

const createBooking = async (req: Request, res: Response) => {
    try {

        const { customer_id, vehicle_id } = req.body;

        await userService.getUserById(customer_id as string);

        const vehicle = await vehicleService.getVehicleById(vehicle_id as string);
        if (vehicle?.availability_status === "booked") {
            throw new Error('This vehicle is already booked. Please select another vehicle.');
        }

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

        await bookingService.autoBookingReturn() // run auto booking return;

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

const updateBooking = async (req: Request, res: Response) => {

    try {

        const bookingId = req.params.bookingId as string;

        const booking = await bookingService.getBookingById(bookingId as string);

        if (Number(booking.customer_id) !== req!.user!.id && req!.user!.role !== Roles.ADMIN) {
            throw new Error('You are not authorized to update this booking.');
        }

        const updateBooking = await bookingService.updateBooking(bookingId as string, req.body, req.user as JwtPayload);

        if (req?.body?.status == 'cancelled') {
            res.status(200).json({
                success: true,
                message: "Booking cancelled successfully",
                data: {
                    id: updateBooking.id,
                    customer_id: Number(updateBooking.customer_id),
                    vehicle_id: Number(updateBooking.vehicle_id),
                    rent_start_date: updateBooking.rent_start_date.toISOString().split('T')[0],
                    rent_end_date: updateBooking.rent_end_date.toISOString().split('T')[0],
                    total_price: Number(updateBooking.total_price),
                    status: updateBooking.status
                }
            });
        }

        if (req?.body?.status == 'returned') {

            if (req.user!.role !== Roles.ADMIN) {
                throw new Error('You are not authorized to update this booking.');
            }

            const vehicleId = updateBooking.vehicle_id;
            await vehicleService.getVehicleById(vehicleId);
            await vehicleService.updateVehicle(vehicleId, { availability_status: "available" });

            const updateVehicle = await vehicleService.getVehicleById(updateBooking.vehicle_id);

            res.status(200).json({
                success: true,
                message: "Booking marked as returned. Vehicle is now available",
                data: {
                    id: updateBooking.id,
                    customer_id: Number(updateBooking.customer_id),
                    vehicle_id: Number(updateBooking.vehicle_id),
                    rent_start_date: updateBooking.rent_start_date.toISOString().split('T')[0],
                    rent_end_date: updateBooking.rent_end_date.toISOString().split('T')[0],
                    total_price: Number(updateBooking.total_price),
                    status: updateBooking.status,
                    vehicle: {
                        availability_status: updateVehicle.availability_status
                    }
                }
            });
        }
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
    updateBooking
}