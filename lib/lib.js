"use strict";

import uuid from "node-uuid";
import uid from "uid-safe";
import moment from "moment";
import cassandra from "./cassandra";
import config from "../config.json";
import messages from "./messages";
import request from "request";
import validator from "validator";

exports.post = (req, res) => {
  //TODO: set type of organization
  if (req.orgid && req.body) {
    let required = ['name', 'phone', 'email', 'countryid', 'stateid'],
      allPass = true;
    required.map((k) => {
      if (typeof req.body[k] === "undefined" || req.body[k].trim() === "") {
        allPass = false;
      }
    });
    if (allPass) {
      let id = uuid.v4(),
        name = req.body.name.toLowerCase().trim(),
        secret = 'sk_' + uid.sync(16),
        apiKey = 'pk_' + uid.sync(16),
        allowed = ['facebook', 'name', 'phone', 'taxinfo', 'twitter', 'venues', 'www', 'email'],
        fields = {'orgid': id, 'created': ~~(new Date().getTime() / 1e3), 'deleted': false, 'creator': req.orgid},
        state = [];
      request.get({
        url: `${config.api.uri}/v1/country/${req.body.countryid}`,
        headers: {'x-asd-apikey': config.api.pk},
        json: true
      }, (error, response, body) => {
        if (body.states) {
          state = body.states.filter(function (t) {
            return t.stateid === req.body.stateid
          });
        }
        if (error || typeof body.states === "undefined" || !state.length) {
          res.status(404).json({
            code: 404,
            data: {
              error: true,
              message: messages.es.noCountry
            }
          });
        } else {
          allowed.map((k) => {
            if (typeof req.body[k] !== "undefined") {
              fields[k] = req.body[k];
            }
          });
          let marker = Object.keys(fields).map((key) => '?'),
            queries = [{
              query: `INSERT INTO ${config.db.keyspace}.org (${Object.keys(fields).join(',')}) VALUES (${marker})`,
              params: Object.keys(fields).map((key) => fields[key])
            }, {
              query: `INSERT INTO ${config.db.keyspace}.apikey (apikey, created, orgid, secret) VALUES (?,?,?,?)`,
              params: [apiKey, ~~(new Date().getTime() / 1e3), id, secret]
            }];

          cassandra.batch(queries, {consistency: 6, prepare: true}, (err) => {
            if (err) {
              res.status(500).json({
                code: 500,
                data: {
                  error: true,
                  message: messages.es.query
                }
              });
            } else {
              getOrganization(id, (data) => {
                let code = (data.error) ? 500 : 201;
                res.status(code).json({
                  code: code,
                  data: data
                });
              });
            }
          });
        }
      });
    } else {
      res.status(500).json({
        code: 500,
        data: {
          error: true,
          message: messages.es.required
        }
      });
    }
  } else {
    res.status(500).json({
      code: 500,
      data: {
        error: true,
        message: messages.es.required
      }
    });
  }
};


let getList = (eventid, next) => {
  if (eventid && validator.isUUID(eventid.toString())) {
    let query = `SELECT * FROM ${config.db.keyspace}.questions WHERE eventid = ${eventid} ALLOW FILTERING`,
      question = [],
      final = [];
    cassandra.stream(query)
      .on('readable', function () {
        let row;
        while (row = this.read()) {
          if (row.eventid.toString() === eventid.toString()) {
            question.push(row);
          }
        }
      })
      .on('error', () => {
        next({error: true, message: messages.es.query});
      }).on('end', () => {
        let final = question;
        final.created = moment.unix(question.created).format("DD/MM/YYYY H:mm:ss");
        next(final);

    });
  } else {
    next({error: true, message: messages.es.required})
  }
}

exports.list = (req, res) => {

  if ( req.params.eventid && typeof req.params.eventid !== "undefined" && req.params.eventid.length) {
    getList(req.params.eventid, (result) => {
      const code = (result.error) ? 404 : 200;
      res.status(code).json({
        code: code,
        data: result
      });
    });
  } else {
    res.status(500).json({
      code: 500,
      data: {
        error: true,
        message: messages.es.required
      }
    });
  }
};
