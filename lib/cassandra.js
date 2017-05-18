"use strict";
import cassandralib from "cassandra-driver";
import config from "../config.json";

config.db.authProvider = new cassandralib.auth.PlainTextAuthProvider(config.db.username, config.db.password);
let cassandra = new cassandralib.Client(config.db);

module.exports = cassandra;