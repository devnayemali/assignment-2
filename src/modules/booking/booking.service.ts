import { pool } from "../../database/database";

interface BookingPayload {
    customer_id: string;
    vehicle_id: string;
    rent_start_date: string;
    rent_end_date: string;
}

const createBooking = async (
    payload: BookingPayload,
    vehicle: Record<string, unknown>
) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    if (!rent_start_date) throw new Error('Rent start date is required.');
    if (!rent_end_date) throw new Error('Rent end date is required.');

    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);

    if (endDate < startDate) {
        throw new Error('Rent end date must be after rent start date.');
    }

    const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const daily_rent_price = vehicle.daily_rent_price as number;
    const total_price = daily_rent_price * dayDiff;

    const result = await pool.query(
        `INSERT INTO bookings (
            customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
        ) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *;`,
        [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    const booking = result.rows[0];

    booking.customer_id = Number(booking.customer_id);
    booking.vehicle_id = Number(booking.vehicle_id);
    booking.total_price = Number(booking.total_price);
    booking.rent_start_date = rent_start_date;
    booking.rent_end_date = rent_end_date;

    const output = {
        ...booking,
        vehicle: {
            vehicle_name: vehicle.vehicle_name,
            daily_rent_price: vehicle.daily_rent_price
        }
    };

    return output;
};

const getAllBookings = async () => {
    const result = await pool.query(
        `SELECT 
            b.id,
            b.customer_id,
            b.vehicle_id,
            b.rent_start_date,
            b.rent_end_date,
            b.total_price,
            b.status,

            -- Customer details
            u.name AS customer_name,
            u.email AS customer_email,

            -- Vehicle details
            v.vehicle_name,
            v.registration_number,
            v.availability_status

        FROM bookings b
        LEFT JOIN users u ON b.customer_id = u.id
        LEFT JOIN vehicles v ON b.vehicle_id = v.id
        ORDER BY b.id DESC;`
    );

    // Format data
    return result.rows.map(row => ({
        id: row.id,
        customer_id: Number(row.customer_id),
        vehicle_id: Number(row.vehicle_id),
        rent_start_date: row.rent_start_date.toISOString().split('T')[0],
        rent_end_date: row.rent_end_date.toISOString().split('T')[0],
        total_price: Number(row.total_price),
        status: row.status,
        customer: {
            name: row.customer_name,
            email: row.customer_email
        },
        vehicle: {
            vehicle_name: row.vehicle_name,
            registration_number: row.registration_number
        }
    }));
};

const getMyBookings = async (userId: string) => {

    const result = await pool.query(
        `SELECT 
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,

        -- Vehicle details
        v.vehicle_name,
        v.registration_number,
        v.type

    FROM bookings b
    LEFT JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.customer_id = $1
    ORDER BY b.id DESC;`,
        [userId]
    );

    // Format data
    return result.rows.map(row => ({
        id: row.id,
        customer_id: Number(row.customer_id),
        vehicle_id: Number(row.vehicle_id),
        rent_start_date: row.rent_start_date.toISOString().split('T')[0],
        rent_end_date: row.rent_end_date.toISOString().split('T')[0],
        total_price: Number(row.total_price),
        status: row.status,
        vehicle: {
            vehicle_name: row.vehicle_name,
            registration_number: row.registration_number,
            type: row.type
        }
    }));
};

const updateBooking = async (bookingId: string, payload: Record<string, any>) => {

    const existing = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);

    if (existing.rows.length === 0) {
        throw new Error("Booking not found.");
    }

    if (payload?.status == undefined) {
        throw new Error("Status is required.");
    }

    const result = await pool.query(`UPDATE bookings SET status = $1 WHERE id = $2`, [payload.status, bookingId]);

    if (result.rowCount === 0) {
        throw new Error("Failed to update booking.");
    }

    const updated = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);

    return updated.rows[0];

};

const autoBookingReturn = async () => {

    // Get expired bookings
    const expiredBookings = await pool.query(
        `SELECT id, vehicle_id FROM bookings
             WHERE rent_end_date < CURRENT_DATE;`
    );
    

    for (const booking of expiredBookings.rows) {
        const { id, vehicle_id } = booking;
        
        // Update booking status
        await pool.query(
            `UPDATE bookings SET status = 'returned' WHERE id = $1`,
            [id]
        );

        // Free vehicle
        await pool.query(
            `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
            [vehicle_id]
        );
    }

}

export const bookingService = {
    getAllBookings,
    createBooking,
    updateBooking,
    getMyBookings,
    autoBookingReturn
}