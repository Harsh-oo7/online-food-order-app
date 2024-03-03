import express, { Request, Response, NextFunction } from "express";
const router = express.Router();


router.post('/login')

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Vendor" });
});

export { router as VendorRoute };
