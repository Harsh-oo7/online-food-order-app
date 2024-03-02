import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { AdminRoute, VendorRoute } from "./routes";
import { MONGO_URI } from "./config";
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/admin", AdminRoute);
app.use("/vendor", VendorRoute);

mongoose
  .connect(MONGO_URI as string)
  .then((result) => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.log("Error connecting to Mongo", err);
  });

app.listen(8000, () => {
  console.log("App is listening to the port 8000");
});
