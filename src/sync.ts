import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";
import { uri, dbName } from "./mongodb";
import { Item } from "./types";

const sourceCollectionName: string = "customers";
const anonymisedCollectionName: string = "customers_anonymised";
const batchSize: number = 1000;
const interval: number = 1000;

const syncData = async (fullReindex: boolean = false) => {
  try {
    const client: MongoClient = await MongoClient.connect(uri);
    const db: Db = client.db(dbName);
    const sourceCollection: Collection<Item> =
      db.collection(sourceCollectionName);
    const anonymisedCollection: Collection<Item> = db.collection(
      anonymisedCollectionName,
    );

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
      console.log(lastProcessedId);
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

const anonymizeCustomers = (customers: Item[]): Item[] => {
  return customers.map((customer) => anonymizeCustomer(customer));
};

const anonymizeCustomer = (customer: Item): Item => {
  const anonymizedCustomer = { ...customer };

  anonymizedCustomer.firstName = faker.string.alphanumeric({ length: 8 });
  anonymizedCustomer.lastName = faker.string.alphanumeric({ length: 8 });
  anonymizedCustomer.email = anonymizeEmail(customer.email);
  anonymizedCustomer.address.line1 = faker.string.alphanumeric({ length: 8 });
  anonymizedCustomer.address.line2 = faker.string.alphanumeric({ length: 8 });
  anonymizedCustomer.address.postcode = faker.string.alphanumeric({
    length: 8,
  });

  return anonymizedCustomer;
};

function anonymizeEmail(email: string): string {
  const [username, domain] = email.split("@");

  const anonymizedUsername: string = faker.string.alphanumeric({ length: 8 });

  const anonymizedEmail = anonymizedUsername + "@" + domain;
  return anonymizedEmail;
}

const fullReindex = process.argv[2] === "--full-reindex";

syncData(fullReindex);
