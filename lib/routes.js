import express from "express";
let router = express.Router();

router.get('/', function (req, res) {
  res.status(200).json({
    error: false,
    version: '1.0.0',
    message: 'Asdeporte microservices scaffold'
  })
});

module.exports = router;
