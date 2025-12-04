import express, { Request, Response } from 'express';
import { Pool } from "pg";

const app = express()
const port = 3000;

app.use(express.json());

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_poue56wFyCIT@ep-green-breeze-a8hws7hp-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
});


const initDB = async () => {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password TEXT NOT NULL CHECK (char_length(password) >= 6),
            phone VARCHAR(50) NOT NULL,
            role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customer'))
        );   
    `);

    // email	Required, unique, lowercase
    // password	Required, min 6 characters
    // role	'admin' or 'customer'

    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id SERIAL PRIMARY KEY,
            vehicle_name VARCHAR(100) NOT NULL,
            type VARCHAR(50),
            registration_number VARCHAR(200) NOT NULL UNIQUE,
            daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
            availability_status VARCHAR(20)
        );   
    `);
    // type	'car', 'bike', 'van' or 'SUV'
    // daily_rent_price	Required, positive
    // availability_status	'available' or 'booked'


    await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
                rent_start_date DATE NOT NULL,
                rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
                total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
                status VARCHAR(50)
            );
        `);
    // status	'active', 'cancelled' or 'returned'

}
initDB();


app.get('/', (req, res) => {
    res.send('Hello World!')
});


app.post('/api/v1/auth/signup', async (req: Request, res: Response) => {

    const { name, email, password, phone, role } = req.body;

    // check email exists
    const checkEmail = await pool.query(
        `SELECT * FROM users where email=($1)`, [email]);
    if (checkEmail.rowCount === 1) {
        res.status(400).json({
            success: false,
            message: 'Email already exists in the database. Please use a different email address.'
        })
    }

    // Email must be all lowercase
    if (email !== email.toLowerCase()) {
        return res.status(400).json({
            success: false,
            message: "Email must contain only lowercase characters"
        });
    }

    // Password must be at least 6 characters
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    const result = await pool.query(
        `INSERT INTO users (name, email, password, phone, role) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *;`,
        [name, email, password, phone, role]);

    const user = result.rows[0];
    delete user.password;

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user
    });

});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})