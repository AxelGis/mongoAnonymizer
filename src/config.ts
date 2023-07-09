import * as dotenv from "dotenv";
dotenv.config();

export const uri: string = process.env.DB_URI || "mongodb://localhost:27017";
export const dbName: string = "shop";
