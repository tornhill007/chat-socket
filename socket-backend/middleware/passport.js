const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('../config/keys');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.jwt
}

const Users = require('../models/Users');

module.exports = passport => {
    passport.use(
        new JwtStrategy(options, async (payload, done) => {
            try {

                // const user = await pool.query("SELECT * FROM registration WHERE userId=$1", [payload.userId]);
                const user = await Users.findUserByUserId(payload.userId);
                if(user.length !== 0) {
                    done(null, user)
                }
                else {
                    done(null, false);
                }
            }
            catch(err) {
                console.log(err);
            }

        })
    )
}