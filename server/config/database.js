import dotenv from "dotenv";
import {MongoClient} from "mongodb";

dotenv.config();

const url = process.env.MONGODB;

export const client = new MongoClient(url);

export const connection = await client.connect();

