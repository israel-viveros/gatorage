"use strict";

import express from "express";
import logger from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./lib/routes";
import messages from "./lib/messages";

let app = express();

app.use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .use('/', routes);

if (app.get('env') !== 'test') {
  app.use(logger('dev'));
}


app.use(function (req, res) {
  res.status(404).json({error: true, message: messages.es.notfound});
});


if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500).json({error: true, message: err.message});
  });
}

app.use((err, req, res) => {
  res.status(err.status || 500).json({error: true, message: error.message});
});


module.exports = app;