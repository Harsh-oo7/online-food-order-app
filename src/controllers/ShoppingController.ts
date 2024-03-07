import express, { Request, Response, NextFunction } from "express";
import { FoodDoc, Vendor } from "../models";

export const GetFoodsAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vendor.find({
    pincode: pincode,
    serviceAvailable: true,
  })
    .sort({ rating: "descending" })
    .populate("foods");

  if (result.length > 0) {
    return res.json(result);
  }

  return res.json({ message: "No food found" });
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vendor.find({
    pincode: pincode,
    serviceAvailable: true,
  })
    .sort({ rating: "descending" })
    .limit(5);

  if (result.length > 0) {
    return res.json(result);
  }

  return res.json({ message: "No food found" });
};

export const GetFoodsIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vendor.find({
    pincode: pincode,
    serviceAvailable: true,
  }).populate("foods");

  if (result.length > 0) {
    let foodResults: any = [];
    result.map((vendor) => {
      const foods = vendor.foods as [FoodDoc];

      foodResults.push(...foods.filter((food) => food.readyTime <= 30));
    });
    return res.json(foodResults);
  }

  return res.json({ message: "No food found" });
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vendor.find({
    pincode: pincode,
    serviceAvailable: true,
  }).populate("foods");

  if (result.length > 0) {
    let foodResults: any = [];
    result.map((vendor) => foodResults.push(...vendor.foods));
    return res.json(foodResults);
  }

  return res.json({ message: "No food found" });
};

export const RestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const result = await Vendor.findById(id).populate("foods");

  if (result) {
    return res.json(result);
  }

  return res.json({ message: "No food found" });
};
