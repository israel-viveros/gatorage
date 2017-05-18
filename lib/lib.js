"use strict";
import cassandra from "./cassandra";
import config from "../config.json";

exports.post = (req, res) => {
  let query = `SELECT count(*) FROM ${config.db.keyspace}.user`,
    params = [];
  cassandra.execute(query, params, {
    consistency: 6,
    prepare: true
  }, (err, data) => {
    res.status(200).json({
      error: false,
      version: '1.0.0',
      message: 'Asdeporte microservice scaffold',
      cassandra: (!err)
    })
  });
};