import * as passportStrategy from "passport-local";
import passport from "passport";
import bcrypt from "bcrypt";
import User from "./models/user.js";

export function initPassport(app) {
    const usersDB = new User();
    usersDB.initUsers();
    app.use(passport.initialize());
    app.use(passport.authenticate('session'));


    /*

    Cases handled by passport.authenticate:
    1.The email variable is empty so call done with error null and user false
    2.User was found so call done with error null and send the user.
    3.User was not found with the given credentials so like case 1 call done with error null and user false.
    4. Call done with error

     */

    passport.use(new passportStrategy.Strategy(
        { usernameField: "email"}, async (email, password, done) => {
            try {
                if (!email) { done(null, false) }
                const user = usersDB.findUser(email);
                console.log(user);
                if (user.email === email && await bcrypt.compare(password, (user.password).toString())) {
                    done(null, usersDB.users[0]);
                } else {
                    done(null, false, { message: "User or password incorrect"});
                }
            } catch (e) {
                done(e);
            }
        }));

    passport.serializeUser((req, user, done) => {
        done(null, user);
    });


    passport.deserializeUser((user, done) => {
        const u = usersDB.findUser(user.email);
        done(null, u);
    });

}

export function isAuthenticated(req ,res, next) {
    if(req.isAuthenticated()) return next()

    res.redirect("/");

}