import { Db, MongoClient, ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";
import { uri, dbName } from "./config";
import { Item } from "./types";

const sourceCollectionName: string = "customers"; //main collection name
const anonymisedCollectionName: string = "customers_anonymised"; //anonymized collection name
const batchSize: number = 1000; //batch size
const interval: number = 1000; //insert data interval in miliseconds

/**
 * Anonymize data from sourceCollectionName and save to anonymisedCollectionName
 * @param fullReindex - If true - full reindex data
 */
const syncData = async (fullReindex: boolean = false) => {
  try {
    const client: MongoClient = await MongoClient.connect(uri);
    const db: Db = client.db(dbName);
    const sourceCollection = db.collection<Item>(sourceCollectionName);
    const anonymisedCollection = db.collection<Item>(anonymisedCollectionName);

    const getLastId = async (): Promise<ObjectId | undefined> => {
      const lastId: Item | null = await anonymisedCollection.findOne(
        {},
        { sort: { _id: -1 } },
      );
      return lastId?._id;
    };

    let lastProcessedId: ObjectId | undefined = fullReindex
      ? undefined
      : await getLastId();

    const getCustomers = async (): Promise<Item[]> => {
      const customers: Item[] = await sourceCollection
        .find(lastProcessedId ? { _id: { $gt: lastProcessedId } } : {})
        .limit(batchSize)
        .toArray();

      return customers;
    };

    const updateAnonymizedCollection = async (customers: Item[]) => {
      const anonymizedCustomers: Item[] = anonymizeCustomers(customers);

      await anonymisedCollection.bulkWrite(
        anonymizedCustomers.map((customer) => ({
          updateOne: {
            filter: { _id: customer._id },
            update: { $set: customer },
            upsert: true,
          },
        })),
        { ordered: false },
      );

      lastProcessedId = customers[customers.length - 1]._id;
    };

    if (fullReindex) {
      //full reindex mode
      console.log("Full reindex start");
      await anonymisedCollection.deleteMany({});

      while (true) {
        const customers: Item[] = await getCustomers();

        if (customers.length === 0) {
          break;
        }

        await updateAnonymizedCollection(customers);

        if (customers.length < batchSize) {
          break;
        }
      }

      console.log("Full reindex complete");
      process.exit(0);
    } else {
      //real-time mode
      console.log("Real-time sync start...");

      while (true) {
        const customers: Item[] = await getCustomers();

        if (customers.length > 0) {
          await updateAnonymizedCollection(customers);
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * Returns array of anonymized customers
 * @param customers
 * @returns
 */
const anonymizeCustomers = (customers: Item[]): Item[] => {
  return customers.map((customer) => anonymizeCustomer(customer));
};

/**
 * Clone customer object and anonymize some fields
 * @param customer
 * @returns
 */
const anonymizeCustomer = (customer: Item): Item => {
  const anonymizedCustomer = { ...customer };

  anonymizedCustomer.firstName = anonymizeProperty(customer.firstName);
  anonymizedCustomer.lastName = anonymizeProperty(customer.lastName);
  anonymizedCustomer.email = anonymizeEmail(customer.email);
  anonymizedCustomer.address.line1 = anonymizeProperty(customer.address.line1);
  anonymizedCustomer.address.line2 = anonymizeProperty(customer.address.line2);
  anonymizedCustomer.address.postcode = anonymizeProperty(
    customer.address.postcode,
  );

  return anonymizedCustomer;
};

/**
 * Anonymize email username
 * @param email
 * @returns
 */
const anonymizeEmail = (email: string): string => {
  const [username, domain] = email.split("@");

  const anonymizedUsername: string = anonymizeProperty(username);

  return `${anonymizedUsername}@${domain}`;
};

/**
 * Returns an anonymized string of 8 characters long
 * @param input - input string
 * @returns
 */
const anonymizeProperty = (input: string): string => {
  faker.seed(input.length);
  const randomString: string = faker.string.alphanumeric({ length: 8 });
  return randomString;
};

const fullReindex = process.argv[2] === "--full-reindex";

syncData(fullReindex);
