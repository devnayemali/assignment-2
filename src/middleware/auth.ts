import { NextFunction, Request, Response } from "express";

const auth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;
        console.log({token})
    }
}

export default auth