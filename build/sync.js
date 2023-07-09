"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var faker_1 = require("@faker-js/faker");
var config_1 = require("./config");
var sourceCollectionName = "customers"; //main collection name
var anonymisedCollectionName = "customers_anonymised"; //anonymized collection name
var batchSize = 1000; //batch size
var interval = 1000; //insert data interval in miliseconds
/**
 * Anonymize data from sourceCollectionName and save to anonymisedCollectionName
 * @param fullReindex - If true - full reindex data
 */
var syncData = function (fullReindex) {
    if (fullReindex === void 0) { fullReindex = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var client, db, sourceCollection_1, anonymisedCollection_1, getLastId, lastProcessedId_1, _a, getCustomers, updateAnonymizedCollection, customers, customers, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 17, , 18]);
                    return [4 /*yield*/, mongodb_1.MongoClient.connect(config_1.uri)];
                case 1:
                    client = _b.sent();
                    db = client.db(config_1.dbName);
                    sourceCollection_1 = db.collection(sourceCollectionName);
                    anonymisedCollection_1 = db.collection(anonymisedCollectionName);
                    getLastId = function () { return __awaiter(void 0, void 0, void 0, function () {
                        var lastId;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, anonymisedCollection_1.findOne({}, { sort: { _id: -1 } })];
                                case 1:
                                    lastId = _a.sent();
                                    return [2 /*return*/, lastId === null || lastId === void 0 ? void 0 : lastId._id];
                            }
                        });
                    }); };
                    if (!fullReindex) return [3 /*break*/, 2];
                    _a = undefined;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, getLastId()];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    lastProcessedId_1 = _a;
                    getCustomers = function () { return __awaiter(void 0, void 0, void 0, function () {
                        var customers;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, sourceCollection_1
                                        .find(lastProcessedId_1 ? { _id: { $gt: lastProcessedId_1 } } : {})
                                        .limit(batchSize)
                                        .toArray()];
                                case 1:
                                    customers = _a.sent();
                                    return [2 /*return*/, customers];
                            }
                        });
                    }); };
                    updateAnonymizedCollection = function (customers) { return __awaiter(void 0, void 0, void 0, function () {
                        var anonymizedCustomers;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    anonymizedCustomers = anonymizeCustomers(customers);
                                    return [4 /*yield*/, anonymisedCollection_1.bulkWrite(anonymizedCustomers.map(function (customer) { return ({
                                            updateOne: {
                                                filter: { _id: customer._id },
                                                update: { $set: customer },
                                                upsert: true,
                                            },
                                        }); }), { ordered: false })];
                                case 1:
                                    _a.sent();
                                    lastProcessedId_1 = customers[customers.length - 1]._id;
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    if (!fullReindex) return [3 /*break*/, 10];
                    //full reindex mode
                    console.log("Full reindex start");
                    return [4 /*yield*/, anonymisedCollection_1.deleteMany({})];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    if (!true) return [3 /*break*/, 9];
                    return [4 /*yield*/, getCustomers()];
                case 7:
                    customers = _b.sent();
                    if (customers.length === 0) {
                        return [3 /*break*/, 9];
                    }
                    return [4 /*yield*/, updateAnonymizedCollection(customers)];
                case 8:
                    _b.sent();
                    if (customers.length < batchSize) {
                        return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 6];
                case 9:
                    console.log("Full reindex complete");
                    process.exit(0);
                    return [3 /*break*/, 16];
                case 10:
                    //real-time mode
                    console.log("Real-time sync start...");
                    _b.label = 11;
                case 11:
                    if (!true) return [3 /*break*/, 16];
                    return [4 /*yield*/, getCustomers()];
                case 12:
                    customers = _b.sent();
                    if (!(customers.length > 0)) return [3 /*break*/, 14];
                    return [4 /*yield*/, updateAnonymizedCollection(customers)];
                case 13:
                    _b.sent();
                    _b.label = 14;
                case 14: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, interval); })];
                case 15:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_1 = _b.sent();
                    console.error(error_1);
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    });
};
/**
 * Returns array of anonymized customers
 * @param customers
 * @returns
 */
var anonymizeCustomers = function (customers) {
    return customers.map(function (customer) { return anonymizeCustomer(customer); });
};
/**
 * Clone customer object and anonymize some fields
 * @param customer
 * @returns
 */
var anonymizeCustomer = function (customer) {
    var anonymizedCustomer = __assign({}, customer);
    anonymizedCustomer.firstName = anonymizeProperty(customer.firstName);
    anonymizedCustomer.lastName = anonymizeProperty(customer.lastName);
    anonymizedCustomer.email = anonymizeEmail(customer.email);
    anonymizedCustomer.address.line1 = anonymizeProperty(customer.address.line1);
    anonymizedCustomer.address.line2 = anonymizeProperty(customer.address.line2);
    anonymizedCustomer.address.postcode = anonymizeProperty(customer.address.postcode);
    return anonymizedCustomer;
};
/**
 * Anonymize email username
 * @param email
 * @returns
 */
var anonymizeEmail = function (email) {
    var _a = email.split("@"), username = _a[0], domain = _a[1];
    var anonymizedUsername = anonymizeProperty(username);
    return "".concat(anonymizedUsername, "@").concat(domain);
};
/**
 * Returns an anonymized string of 8 characters long
 * @param input - input string
 * @returns
 */
var anonymizeProperty = function (input) {
    faker_1.faker.seed(input.length);
    var randomString = faker_1.faker.string.alphanumeric({ length: 8 });
    return randomString;
};
var fullReindex = process.argv[2] === "--full-reindex";
syncData(fullReindex);
