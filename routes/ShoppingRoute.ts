import express, { Request, Response, NextFunction } from "express";
import { GetFoodsAvailability, GetFoodsIn30Min, GetTopRestaurants, RestaurantById, SearchFoods } from "../controllers";

const router = express.Router()

/** ------------------------------------Food Availability------------------------------------**/
router.get('/:pincode', GetFoodsAvailability)

/** ------------------------------------Top Restaurant------------------------------------**/
router.get('/top-restaurants/:pincode', GetTopRestaurants)

/** ------------------------------------Food Availability in 30 Mins------------------------------------**/
router.get('/foods-in-30-min/:pincode', GetFoodsIn30Min)

/** ------------------------------------Search Foods------------------------------------**/
router.get('/search/:pincode', SearchFoods)

/** ------------------------------------Find Restaurant By ID------------------------------------**/
router.get('/restaurant/:id', RestaurantById)


export {router as ShoppingRoute }