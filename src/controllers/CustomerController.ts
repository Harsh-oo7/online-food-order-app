import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  UserLoginInputs,
  EditCustomerProfileInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  onRequestOTP,
} from "../utility";
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
    email: email,
  });
  if (existingCustomer) {
    return res.json({ message: "Account already exist" });
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
    await onRequestOTP(otp, phone);

    // generate signature
    const signature = GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });

    // send the result back
    return res.json({
      signature,
      email: result.email,
      verified: result.verified,
    });
  }

  return res.json({
    message: "User not created due to some internal server error",
  });
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, {
    validationError: { target: false },
  });

  if (loginErrors.length > 0) {
    return res.json(loginErrors);
  }

  const { email, password } = loginInputs;
  const customer = await Customer.findOne({ email: email });

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });

      // send the result back
      return res.json({
        signature,
        email: customer.email,
        verified: customer.verified,
      });
    }
  }

  return res.status(404).json({ message: "Error with login" });
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;

  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      if (profile.otp == parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
        const updatedProfile = await profile.save();

        const signature = GenerateSignature({
          _id: updatedProfile._id,
          email: updatedProfile.email,
          verified: updatedProfile.verified,
        });

        return res.json({
          signature,
          email: updatedProfile.email,
          verified: updatedProfile.verified,
        });
      }
    }
  }

  return res.json({ message: "Error while verifying OTP" });
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      const { otp, otp_expiry } = GenerateOtp();

      profile.otp = otp;
      profile.otp_expiry = otp_expiry;

      await profile.save();

      await onRequestOTP(otp, profile.phone);

      return res.json({ message: "Message sent successfully" });
    }
  }

  return res.json({ message: "Error while verifying" });
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);

    return res.json(profile);
  }

  return res.json({ message: "Profile not found" });
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstName, lastName, address } = profileInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();

      return res.json(result);
    }
  }

  return res.json({ message: "Error while updating profile" });
};
