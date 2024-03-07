import { ACCOUNTSID, AUTHTOKEN } from "../config";

export const GenerateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    let expiry = new Date();
    expiry.setTime(new Date().getTime() + (30*60*1000))

    return { otp, otp_expiry: expiry }
}

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {

    console.log("Sending otp...", otp)
}