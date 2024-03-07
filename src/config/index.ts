import dotenv from 'dotenv'
dotenv.config()

export const MONGO_URI = process.env.MONGO_URI
export const APP_SECRET = process.env.APP_SECRET
export const ACCOUNTSID = process.env.accountSid
export const AUTHTOKEN = process.env.authToken
export const PORT = process.env.PORT || 8000