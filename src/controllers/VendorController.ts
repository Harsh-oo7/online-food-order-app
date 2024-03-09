import { Request, Response, NextFunction } from "express";
import { EditVendorInput, VendorLoginInputs } from "../dto";
import { FindVendor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Food, Order } from "../models";

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VendorLoginInputs>req.body;

  const existingVendor = await FindVendor("", email);

  if (existingVendor) {
    const validation = await ValidatePassword(
      password,
      existingVendor.password,
      existingVendor.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: existingVendor._id,
        email: existingVendor.email,
        foodTypes: existingVendor.foodType,
        name: existingVendor.name,
      });
      return res.json(signature);
    }
  }

  return res.json({ message: "Login creds are not valid" });
};

export const GetVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingVendor = await FindVendor(user._id);

    return res.json(existingVendor);
  }

  return res.json({ message: "Vendor not found" });
};

export const UpdateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { foodType, name, address, phone } = <EditVendorInput>req.body;
  if (user) {
    const existingVendor = await FindVendor(user._id);

    if (existingVendor) {
      existingVendor.name = name;
      existingVendor.foodType = foodType;
      existingVendor.address = address;
      existingVendor.phone = phone;

      const vendorSaved = await existingVendor.save();
      return res.json(existingVendor);
    }

    return res.json(existingVendor);
  }

  return res.json({ message: "Vendor not found" });
};

export const UpdateVendorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {

    const vendor = await FindVendor(user._id);

    if (vendor) {

      const files = req.files as [Express.Multer.File]
      const images = files.map((file: Express.Multer.File) => file.filename)

      vendor.coverImages.push(...images)

      const result = await vendor.save();

      return res.json(result);
    }
  }

  return res.json({ message: "Something went wrong while adding food" });
};

export const UpdateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const existingVendor = await FindVendor(user._id);

    if (existingVendor) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

      const vendorSaved = await existingVendor.save();
      return res.json(existingVendor);
    }

    return res.json(existingVendor);
  }

  return res.json({ message: "Vendor not found" });
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const { name, description, category, foodType, readyTime, price } = <
      CreateFoodInputs
    >req.body;

    const vendor = await FindVendor(user._id);

    if (vendor) {

      const files = req.files as [Express.Multer.File]
      const images = files.map((file: Express.Multer.File) => file.filename)

      const createdFood = await Food.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        foodType: foodType,
        readyTime: readyTime,
        price: price,
        images: images,
        rating: 0,
      });

      vendor.foods.push(createdFood._id);
      const result = await vendor.save();

      return res.json(result);
    }
  }

  return res.json({ message: "Something went wrong while adding food" });
};

export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const foods = await Food.find({vendorId: user._id})

    if(foods) {
      return res.json(foods)
    }
  }

  return res.json({ message: "Foods not found" });
};

export const GetCurrentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const user = req.user;
  if(user) {
    const orders = await Order.find({vendorId: user._id}).populate('items.food')
    if(orders) {
      return res.json(orders)
    }
  }

  return res.json({ message: "No Orders found" });
}

export const GetOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if(orderId) {
    const order = await Order.findById(orderId).populate('items.food')
    if(order) {
      return res.json(order)
    }
  }

  return res.json({ message: "No Orders found" });

}

export const ProcessOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  const { status, remarks, time} = req.body;

  if(orderId) {
    const order = await Order.findById(orderId).populate('items.food')
    if(order) {
      order.orderStatus = status
      order.remarks = remarks
      if(time) order.readyTime = time

      const orderResult = await order.save()
      return res.json(orderResult)
    }
  }

  return res.json({ message: "No Orders found" });

}