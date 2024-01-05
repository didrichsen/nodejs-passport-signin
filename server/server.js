import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from 'passport';
import {client} from "./config/database.js";
import MongoStore from "connect-mongo";
import './config/passport-js.js';
import router from "./routes/routes.js";

dotenv.config();

const port = 3000;
const app = express();
const address = "http://localhost:3000";

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*

Our session middle is going to be responsible for:

1. Initialize a session
2. Storing the session in our database
3. Set cookie equal to session id (storing session id in cookie)
4. Send the cookie to the client through response header (Set-Cookie)

Cookie will then be a part of every request from the client to the server.
The session middleware will then take the cookie from the request header and
then find the session in the store using the value from the cookie.

This session is used by passport when authenticating a user.

 */

app.use(session({
    secret: process.env.SUPER_SECRET_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        client,
        dbName: "passport-js",
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));


app.use(passport.initialize());
app.use(passport.session());

/*
    Middleware for illustration purposes only.

    Before login: req.session will be present, but it won't have property user and req.user will be undefined
    After successful login: req.session will have property user and req.user will contain user.
 */

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});

app.use(router);

app.listen( port, () => {
    console.log("Server started at port " + address);
});