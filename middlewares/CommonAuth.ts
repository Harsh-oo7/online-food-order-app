import { AuthPayload } from "../dto/Auth.dto";
import { NextFunction, Request, Response } from "express";
import { ValidateSignature } from "../utility";


declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const validate = await ValidateSignature(req)

    if(validate) {
        next()
        return
    }

    return res.json({message: "User not authorised"})
}