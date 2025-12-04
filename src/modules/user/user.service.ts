import { pool } from "../../database/database";

const getAllUsers = async () => {

    const result = await pool.query(
        `SELECT id, name, email, phone, role FROM users;`
    );

    return result.rows;
};

// get user by email
const getUserByEmail = async (email: string) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1;`,
        [email]
    );
    return result;
}


export const userService = {
    getAllUsers,
    getUserByEmail
}