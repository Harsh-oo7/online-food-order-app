import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateCustomerInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, onRequestOTP } from "../utility";
import { Customer } from "../models";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);
  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password } = customerInputs;

  const existingCustomer = await Customer.findOne({
    email: email
  })
  if(existingCustomer) {
    return res.json({message: "Account already exist"})
  }

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, otp_expiry } = GenerateOtp();

  const result = await Customer.create({
    email: email,
    password: userPassword,
    salt: salt,
    otp: otp,
    otp_expiry: otp_expiry,
    firstName: "",
    lastName: "",
    address: "",
    verified: false,
    lat: 0,
    lng: 0,
    phone: phone,
  });

  if (result) {
    // send the otp to customer
    await onRequestOTP(otp, phone)

    // generate signature
    const signature = GenerateSignature({
        _id: result._id,
        email: result.email,
        verified: result.verified
    })

    // send the result back
    return res.json({ signature, email: result.email, verified: result.verified})
  }

  return res.json({message: "User not created due to some internal server error"})
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const {otp} = req.body;

    const customer = req.user;

    if(customer) {
        const profile = await Customer.findById(customer._id)

        if(profile) {
            if(profile.otp == parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true
                const updatedProfile = await profile.save();

                const signature = GenerateSignature({
                    _id: updatedProfile._id,
                    email: updatedProfile.email,
                    verified: updatedProfile.verified
                })

                return res.json({ signature, email: updatedProfile.email, verified: updatedProfile.verified})
            }
        }
    }

    return res.json({message: 'Error while verifying OTP'})

};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
