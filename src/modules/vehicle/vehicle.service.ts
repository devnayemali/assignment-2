import { pool } from "../../database/database";

const createVehicle = async (payload: Record<string, unknown>) => {

    const { vehicle_name, type = 'car', registration_number, daily_rent_price, availability_status = 'available' } = payload;

    if (!vehicle_name) {
        throw new Error('Vehicle name are required.');
    }

    if (!registration_number) {
        throw new Error('Registration number are required.');
    }

    if (!daily_rent_price) {
        throw new Error('Daily rent price are required.');
    }

    if (daily_rent_price as number <= 0) {
        throw new Error('Daily rent price must be greater than 0.');
    }

    if (!['car', 'bike', 'van', 'SUV'].includes(type as string)) {
        throw new Error('Type must be car, bike, van or SUV.');
    }

    if (!['available', 'booked'].includes(availability_status as string)) {
        throw new Error('Availability status must be available or booked.');
    }

    const result = await pool.query(
        `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *;`,
        [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );

    result.rows[0].daily_rent_price = Number(result.rows[0].daily_rent_price);

    return result.rows[0];
}

const getAllVehicles = async () => {

    const result = await pool.query(
        `SELECT * FROM vehicles;`
    );

    result.rows.forEach((vehicle) => {
        vehicle.daily_rent_price = Number(vehicle.daily_rent_price);
    });

    return result.rows;
};

const getVehicleByRegistrationNumber = async (registrationNumber: string) => {
    const result = await pool.query(
        `SELECT * FROM vehicles WHERE registration_number = $1;`,
        [registrationNumber]
    );

    return result;
}

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

const deleteVehicle = async (vehicleId: string) => {

    const result = await pool.query(
        `DELETE FROM vehicles WHERE id = $1;`,
        [vehicleId]
    );
    return result;
};



export const vehicleService = {
    getAllVehicles,
    createVehicle,
    getVehicleByRegistrationNumber,
    getVehicleById,
    updateVehicle,
    deleteVehicle
}