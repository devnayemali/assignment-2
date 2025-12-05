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

const updateBooking = async (req: Request, res: Response) => {

    try {

        const bookingId = req.params.bookingId as string;

        const updateBooking = await bookingService.updateBooking(bookingId as string, req.body);

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