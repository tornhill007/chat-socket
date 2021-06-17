const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const Users = require('../models/Users');
const History = require('../models/History');
const passport = require('passport')
const jwt = require("jsonwebtoken");
const keys = require('../config/keys');
//################registration
const catchWrap = require("../common/wrapper");

router.use('/history/:roomId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {

  let decoded = jwt.verify(req.headers.authorization.split(' ')[1], keys.jwt);
  console.log(decoded)
  next()
})

router.get("/history/:roomId", catchWrap(async (req, res) => {
  // const {password, userName} = req.body;
  const roomId = req.params.roomId;

  const history = await History.findOne({
    where: {
      roomid: roomId
    }
  })
  res.json(history);
}))

module.exports = router;