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
            v.registration_number

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

const getVehicleById = async (vehicleId: string) => {

    const result = await pool.query(
        `SELECT * FROM vehicles WHERE id = $1;`,
        [vehicleId]
    );

    if (result.rows.length === 0) {
        throw new Error('Vehicle not found.');
    }

    result.rows[0].daily_rent_price = Number(result.rows[0].daily_rent_price);

    return result.rows[0];
}

const updateVehicle = async (vehicleId: string, payload: Record<string, any>) => {

    const existing = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [vehicleId]);

    if (existing.rows.length === 0) {
        throw new Error("Vehicle not found.");
    }

    const vehicle = existing.rows[0];

    // Merge old + new values
    const updated = {
        vehicle_name: payload.vehicle_name ?? vehicle.vehicle_name,
        type: payload.type ?? vehicle.type,
        registration_number: payload.registration_number ?? vehicle.registration_number,
        daily_rent_price: payload.daily_rent_price ?? vehicle.daily_rent_price,
        availability_status: payload.availability_status ?? vehicle.availability_status,
    };

    // Validation
    if (updated.daily_rent_price <= 0) {
        throw new Error("Daily rent price must be greater than 0.");
    }

    if (!["car", "bike", "van", "SUV"].includes(updated.type)) {
        throw new Error("Type must be car, bike, van or SUV.");
    }

    if (!["available", "booked"].includes(updated.availability_status)) {
        throw new Error("Availability status must be available or booked.");
    }

    // Unique registration_number check
    const check = await pool.query(
        `SELECT id FROM vehicles WHERE registration_number = $1 AND id <> $2`,
        [updated.registration_number, vehicleId]
    );
    if (check.rows.length > 0) {
        throw new Error("Registration number already exists.");
    }

    // Simple update query
    const result = await pool.query(
        `UPDATE vehicles 
         SET vehicle_name = $1, 
             type = $2,
             registration_number = $3,
             daily_rent_price = $4,
             availability_status = $5
         WHERE id = $6
         RETURNING *`,
        [
            updated.vehicle_name,
            updated.type,
            updated.registration_number,
            updated.daily_rent_price,
            updated.availability_status,
            vehicleId
        ]
    );

    result.rows[0].daily_rent_price = Number(result.rows[0].daily_rent_price);

    return result.rows[0];
};


export const bookingService = {
    getAllBookings,
    createBooking,
    getVehicleById,
    updateVehicle,
    getMyBookings
}