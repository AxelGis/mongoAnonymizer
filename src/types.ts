import { ObjectId } from "mongodb";

export type Item = {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  address: Address;
  createdAt: string;
};

export type Address = {
  line1: string;
  line2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
};
