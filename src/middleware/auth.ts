import { NextFunction, Request, Response } from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import { pool } from "../database/database";

const auth = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const decoded = jwt.verify(token, 'devnayemali') as JwtPayload;

            const user = await pool.query(`SELECT * FROM users WHERE email = $1;`, [decoded.email]);
            if (user.rows.length === 0) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            req.user = decoded;

            if (roles.length && !roles.includes(user.rows[0].role)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            next();
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

export default auth