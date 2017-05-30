import express from "express";
import lib from "./lib";

let router = express.Router();

router.get('/v1/question/:eventid/questionid', lib.post);
router.get('/v1/question/:eventid', lib.list);

module.exports = router;
