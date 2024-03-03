import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVendor = async (id: string | undefined, email?: string) => {
  if(email) {
    const vendor = await Vendor.findOne({email: email})
    return vendor;
  }
  return await Vendor.findById(id)
}

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    pincode,
    foodType,
    email,
    password,
    ownerName,
    phone,
  } = <CreateVendorInput>req.body;

  const existingVendor = await FindVendor(undefined, email)
  if (existingVendor) {
    return res.json({ message: "Vendor already exists with that email" });
  }

  const salt = await GenerateSalt();
  const hashPassword = await GeneratePassword(password, salt);

  const createVendor = await Vendor.create({
    name: name,
    address: address,
    pincode: pincode,
    email: email,
    password: hashPassword,
    ownerName: ownerName,
    phone: phone,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    salt: salt,
  });

  return res.json({ message: "Success", data: createVendor });
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (vendors.length != 0) {
    return res.json(vendors);
  }

  return res.json({ message: "No vendors found." });
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req.params.id;
  const vendor = await FindVendor(vendorId)

  if (!vendor) {
    return res.json({ message: "Vendor not found." });
  }

  return res.json(vendor);
};
