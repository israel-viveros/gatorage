"use strict";

import should from "should";
import supertest from "supertest";
import config from "./test_config.json";
const server = supertest.agent(config.uri);
const app = require("../bin/www");


describe("Asdeporte miscroservice Test", () => {
  it("should return home page", (done) => {
    server.get("/")
      .timeout(config.timeout)
      .expect("Content-type", /json/)
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        done()
      });
  });
});