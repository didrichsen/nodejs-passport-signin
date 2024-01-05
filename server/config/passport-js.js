import LocalStrategy from "passport-local";
import passport from "passport";
import {validPassword} from "../lib/passwordUtils.js";
import {ObjectId} from "mongodb";
import {connection} from "./database.js";


    /*
        customFields is a way to make passport use different field names for username and password.
     */

    const customFields = {
        usernameField: "uname",
        passwordField: "pwd"
    };

    /*
        Cases handled by verifyCallback:

        1.If user doesn't exist in DB, return error null and user false - 401 Unauthorized
        2.User exists in DB, but password is incorrect, return error null and user false - 401 Unauthorized
        3.User exists in DB and password is correct, return error null and user object - 200 OK
        4. Error occurred while executing query, return error message
    */

    const verifyCallback = async (username, password, done) => {

        try {

            const user = await connection.db('passport-js').collection('users').findOne({username: username});

            console.log(user);

            if(!user) { return done(null, false) }

            const isValid = validPassword(password, user.hash, user.salt);

            if(isValid) {
                return done(null, user)
            } else {
                return done(null, false)
            }

        } catch (err) {
            return done(err.message);
        }

    }

    const passportStrategy = new LocalStrategy(customFields, verifyCallback);

    passport.use(passportStrategy);

    /*
        serializeUser makes sure that the user id is added as property to the session.
     */

    passport.serializeUser((user, done) => {
        console.log("serializing user" + user.username)
        done(null, user._id);
    });

    /*
    deserializeUser retrieves the user and adds it to the request object as req.user
     */

    passport.deserializeUser(async (userId, done) => {

        try {

            const objectId = new ObjectId(userId);

            const user = await connection.db('passport-js').collection('users').findOne({_id: objectId});

            if (!user) {
                done(null, false);
            }

            console.log("deserializing user" + user.username)

            done(null, user);

        } catch (err) {
            done(err);
        }
    });