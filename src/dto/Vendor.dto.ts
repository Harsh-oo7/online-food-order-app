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