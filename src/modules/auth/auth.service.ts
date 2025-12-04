import bcrypt from "bcryptjs";
import { pool } from "../../database/database";
import jwt from "jsonwebtoken";

const validRoles = ['admin', 'customer'] as const;

interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: typeof validRoles[number];
}

const createUser = async (payload: CreateUserPayload) => {
    const { name, email, password, phone, role = 'customer' } = payload;

    if (!email || email !== email.toLowerCase()) {
        throw new Error('Email must contain only lowercase characters.');
    }

    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
    }

    if (!validRoles.includes(role)) {
        throw new Error("Role must be 'admin' or 'customer'");
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `INSERT INTO users (name, email, password, phone, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, phone, role;`,
        [name, email, hashPassword, phone, role]
    );

    return result.rows[0];
};

// get user by email
const getUserByEmail = async (email: string) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1;`,
        [email]
    );
    return result;
}

const userLogin = async (email: string, password: string) => {

    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1;`,
        [email]
    );

    // check email exists
    if (result.rows.length === 0) {
        throw new Error('User does not exist in the database. Please register first.');
    }

    // check password
    const isMatchPassword = await bcrypt.compare(password, result.rows[0].password);
    if (!isMatchPassword) {
        throw new Error('Password does not match. Please try again.');
    }

    const user = result.rows[0];
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const secretKey = "devnayemali";
    const token = jwt.sign(jwtPayload, secretKey, { expiresIn: '7d' });

    delete user.password;

    return { token, user };

}

export const authService = {
    createUser,
    getUserByEmail,
    userLogin
}