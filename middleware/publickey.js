"use strict";

import config from "../config.json";
import message from "../lib/messages";
import cassandra from "../lib/cassandra";


const requireApikey = (req, res, next) => {
  let apikey = req.query.apikey || req.headers["x-asd-apikey"];
  if ((typeof apikey === "undefined" || apikey === null) || apikey === "") {
    res.status(401).json({error: true, message: message.es.unauthorized});
    res.end();
  } else {
    let query = `SELECT orgid FROM ${config.db.keyspace}.apikey WHERE apikey = ?`;
    cassandra.execute(query, [apikey], {consistency: 6, prepare: true}, (err, data) => {
      if ((typeof err !== "undefined" && err !== null) || !Array.isArray(data.rows) || data.rows.length !== 1) {
        res.status(401).json({error: true, message: message.es.unauthorized});
        res.end()
      } else {
        req.orgid = data.rows[0].orgid;
        next();
      }
    });
  }
};

module.exports = requireApikey;