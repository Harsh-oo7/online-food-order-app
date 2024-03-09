export interface CreateVendorInput {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface VendorLoginInputs {
  email: string,
  password: string,
}

export interface VendorPayload {
  _id: string,
  email: string,
  name: string,
  foodTypes: [string],
}

export interface EditVendorInput   {
  name: string;
  foodType: [string];
  address: string;
  phone: string;
} 

export interface CreateOfferInputs {
  offerType: string;
  vendors: [any];
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  promoType: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}