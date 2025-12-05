import bcrypt from "bcryptjs";
import { pool } from "../../database/database";
import { JwtPayload } from "jsonwebtoken";
import { Roles } from "../auth/auth.constant";

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


const getUserById = async (userId: string) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE id = $1;`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found.');
    }

    return result;
}

const updateUser = async (userId: string, payload: Record<string, unknown>, authUser: JwtPayload) => {

    const authUserId = authUser.id;
    const authUserRole = authUser.role;

    if (authUserRole == Roles.CUSTOMER && authUserId == userId) {
        userId = authUserId;
    } else if (authUserRole === Roles.CUSTOMER && authUserId != userId) {
        throw new Error("You are not authorized to update this user.");
    }

    const existing = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);

    if (existing.rows.length === 0) {
        throw new Error("User not found.");
    }

    const user = existing.rows[0];

    // Merge old + new values
    const updated = {
        name: payload?.name ?? user.name,
        email: (payload?.email as string)?.toLowerCase() ?? user.email,
        phone: payload?.phone ?? user.phone,
        role: payload?.role ?? user.role,
        password: user?.password
    };

    // Update password if provided
    if (payload?.password !== undefined) {
        updated.password = await bcrypt.hash(payload.password as string, 12);
    }

    const email = (payload as any)?.email;
    if (payload?.email !== undefined && payload?.email !== email?.toLowerCase()) {
        throw new Error("Email must be lowercase only.");
    }

    // Validate role
    if (!["admin", "customer"].includes(updated.role)) {
        throw new Error("Role must be 'admin' or 'customer'.");
    }

    // Check unique email
    const check = await pool.query(
        `SELECT id FROM users WHERE email = $1 AND id <> $2`,
        [updated.email, userId]
    );
    if (check.rows.length > 0) {
        throw new Error("Email already exists. Please use a different email.");
    }

    // Corrected SQL (added missing comma)
    const result = await pool.query(
        `UPDATE users 
         SET name = $1, 
             email = $2,
             phone = $3,
             role = $4,
             password = $5
         WHERE id = $6
         RETURNING *`,
        [
            updated.name,
            updated.email,
            updated.phone,
            updated.role,
            updated.password,
            userId
        ]
    );

    return result.rows[0];
};


const deleteVehicle = async (vehicleId: string) => {

    const result = await pool.query(
        `DELETE FROM vehicles WHERE id = $1;`,
        [vehicleId]
    );
    return result;
};

export const userService = {
    getAllUsers,
    getUserByEmail,
    getUserById,
    updateUser
}