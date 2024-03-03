import { Request, Response, NextFunction } from "express";
import { EditVendorInput, VendorLoginInputs } from "../dto";
import { FindVendor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility";

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = <VendorLoginInputs>req.body;

    const existingVendor = await FindVendor("", email)

    if(existingVendor) {
        const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt);

        if(validation) {
            const signature = GenerateSignature({
                _id: existingVendor._id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            })
            return res.json(signature)
        }
    }

    return res.json({message: "Login creds are not valid"})
}

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user) {
        const existingVendor = await FindVendor(user._id)

        return res.json(existingVendor)
    }

    return res.json({message: "Vendor not found"})
}

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const {foodType, name, address, phone} = <EditVendorInput>req.body;
    if(user) {
        const existingVendor = await FindVendor(user._id)

        if(existingVendor) {
            existingVendor.name = name
            existingVendor.foodType = foodType
            existingVendor.address = address
            existingVendor.phone = phone

            const vendorSaved = await existingVendor.save()
            return res.json(existingVendor)
        }

        return res.json(existingVendor)
    }

    return res.json({message: "Vendor not found"})
}

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if(user) {
        const existingVendor = await FindVendor(user._id)

        if(existingVendor) {
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable

            const vendorSaved = await existingVendor.save()
            return res.json(existingVendor)
        }

        return res.json(existingVendor)
    }

    return res.json({message: "Vendor not found"})
}