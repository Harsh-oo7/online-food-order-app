import express, { Request, Response, NextFunction } from "express";

const router = express.Router()

/** ------------------------------------Food Availability------------------------------------**/
router.get('/:pincode')

/** ------------------------------------Top Restaurant------------------------------------**/
router.get('/top-restaurants/:pincode')

/** ------------------------------------Food Availability in 30 Mins------------------------------------**/
router.get('/foods-in-30-min/:pincode')

/** ------------------------------------Search Foods------------------------------------**/
router.get('/search/:pincode')

/** ------------------------------------Find Restaurant By ID------------------------------------**/
router.get('/restaurant/:id')


export {router as ShoppingRoute }