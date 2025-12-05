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

    return result.rows[0];
}

const getAllVehicles = async () => {

    const result = await pool.query(
        `SELECT * FROM vehicles;`
    );

    return result.rows;
};

// get user by email
const getVehicleByRegistrationNumber = async (registrationNumber: string) => {
    const result = await pool.query(
        `SELECT * FROM vehicles WHERE registration_number = $1;`,
        [registrationNumber]
    );
    return result;
}


export const vehicleService = {
    getAllVehicles,
    createVehicle,
    getVehicleByRegistrationNumber
}