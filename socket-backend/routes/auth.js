//################login

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const express = require("express");
const router = express.Router();

const Users = require('../models/Users');

const catchWrap = require("../common/wrapper");

router.post("/login", catchWrap(async (req, res) => {
    const {password, userName} = req.body;
    const user = await Users.findUsersByUserName(userName);

    if (user.length === 0) {
        res.status(404).json({
            message: "User with this name was not found"
        })
        return;
    }

    const passwordResult = bcrypt.compareSync(password, user[0].dataValues.password);

    if (!passwordResult) {
        res.status(401).json({
            message: "Password mismatch, try again"
        })
        return;

    }
    const token = jwt.sign({
        userName: user[0].dataValues.username,
        userId: user[0].dataValues.userid
    }, keys.jwt, {expiresIn: 60 * 60});

    res.status(200).json({
        token: `Bearer ${token}`,
        userName: user[0].dataValues.username,
        userId: user[0].dataValues.userid
    })

}))


module.exports = router;