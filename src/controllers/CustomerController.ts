import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  UserLoginInputs,
  EditCustomerProfileInputs,
  OrderInputs,
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
import { Customer, Food } from "../models";
import { Order } from "../models/Order";

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
    orders: [],
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

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    let profile = await Customer.findById(customer._id);

    const cart = <[OrderInputs]>req.body;

    let cartItems = Array();
    let netAmount = 0;

    const foods = await Food.find({
      _id: {
        $in: cart.map((item) => item._id),
      },
    });
    let vendorId;

    foods.map((food) => {
      cart.map(({ _id, unit }) => {
        if (food._id == _id) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    if (cartItems) {
      const currentOrder = await Order.create({
        orderId: orderId,
        items: cartItems,
        vendorId: vendorId,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: "COD",
        paymentResponse: "",
        orderStatus: "Waiting",
        remarks: "",
        deliveryId: "",
        appliedOffers: false,
        offerId: "",
        readyTime: 45,
      });

      if (currentOrder && profile) {
        profile.cart = [] as any
        profile?.orders.push(currentOrder);
        const profileResponse = await profile?.save();

        return res.json(currentOrder);
      }
    }
  }
  return res.json({ message: "Error while creating order" });
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");

    if (profile) {
      return res.json(profile.orders);
    }
  }

  return res.json({ message: "NO orders found" });
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    return res.json(order);
  }

  return res.json({ message: "NO orders found" });
};

export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    let cartItems = Array();

    const { _id, unit } = <OrderInputs>req.body;
    const food = await Food.findById(_id);

    if (food) {
      if (profile) {
        cartItems = profile.cart;

        if (cartItems.length > 0) {
          let existFoodItem = cartItems.filter(
            (item) => item.food._id.toString() === _id
          );

          if (existFoodItem.length > 0) {
            let index = cartItems.indexOf(existFoodItem[0]);

            if (unit > 0) {
              cartItems[index] = {
                food,
                unit,
              };
            } else {
              cartItems.splice(index, 1);
            }

          } else {
            cartItems.push({
              food,
              unit,
            });
          }


        } else {
          cartItems.push({
            food,
            unit,
          });
        }

        if(cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.json(cartResult.cart)
        }

      }
    }
  }

  return res.json({ message: "Unable to add item to cart" });
};

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if(customer) {
    const profile = await Customer.findById(customer._id).populate('cart.food')

    if(profile) {
      return res.json(profile.cart)
    }

  }

  return res.json({ message: "Cart is empty" });
};

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if(customer) {
    const profile = await Customer.findById(customer._id).populate('cart.food')

    if(profile) {

      profile.cart = [] as any
      const cartResult = await profile.save();

      return res.json(cartResult)
    }

  }

  return res.json({ message: "Cart is already empty" });
};
