import { faker } from "@faker-js/faker";
import { Db, MongoClient } from "mongodb";
import { Item } from "./types";
import { uri, dbName } from "./config";

const collectionName: string = "customers"; //main collection name
const interval: number = 200; //insert data interval in miliseconds

const insertCustomers = async () => {
  try {
    const client: MongoClient = await MongoClient.connect(uri);
    const db: Db = client.db(dbName);
    const collection = db.collection<Item>(collectionName);

    while (true) {
      const customers: Item[] = Array.from(
        { length: faker.number.int({ min: 1, max: 10 }) },
        () => ({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          address: {
            line1: faker.location.streetAddress(),
            line2: faker.location.secondaryAddress(),
            postcode: faker.location.zipCode(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
          },
          createdAt: new Date().toISOString(),
        }),
      );

      await collection.insertMany(customers);

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  } catch (error) {
    console.error(error);
  }
};

insertCustomers();
