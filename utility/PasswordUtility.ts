import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { VendorPayload } from "../dto";
import { APP_SECRET } from "../config";
import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "../dto/Auth.dto";

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = (payload: VendorPayload) => {
  const signature = jwt.sign(payload, APP_SECRET as string, {
    expiresIn: "1d",
  });

  return signature
};

export const ValidateSignature = async (req: Request) => {

    const signature = req.get('Authorization')

    if(signature) {
        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET as string) as AuthPayload

        req.user = payload

        return true
    }

    return false;
}