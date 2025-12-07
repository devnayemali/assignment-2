import { Request, Response } from "express";
import { authService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {

    try {

        const { email } = req.body;

        const checkUser = await authService.getUserByEmail(email as string);
        if (checkUser.rowCount === 1) {
            throw new Error('User already exists.');
        }

        const user = await authService.createUser(req.body);

        delete user.password;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

}

const loginUser = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body;

        const login = await authService.userLogin(email as string, password as string);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: login
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const authController = {
    createUser,
    loginUser
}