"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbName = exports.uri = void 0;
exports.uri = process.env.DB_URI || "mongodb://localhost:27017";
exports.dbName = "shop";
