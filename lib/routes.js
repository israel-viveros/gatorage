import express from "express";
import lib from "./lib";

let router = express.Router();

router.get('/', lib.post);

module.exports = router;
