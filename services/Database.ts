import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export default async () => {
  try {
    await mongoose.connect(MONGO_URI as string);
  } catch (err) {
    console.log(err);
  }

  console.log("Connected To MongoDB...");
};
