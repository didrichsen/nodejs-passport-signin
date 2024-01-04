import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from 'passport';
import { MongoClient } from "mongodb";
import {initPassport, isAuthenticated} from "./passport-middleware.js";
import MongoStore from "connect-mongo";

dotenv.config();

const port = 3000;
const app = express();
const address = "http://localhost:3000";

const url = process.env.MONGODB;
const client = new MongoClient(url);

let db;
client.connect().then((connection) => {
    db = connection.db("passport-js");
    //createAuthRoutes(db);
});

//app.use(middlewareError);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*

Our session middle is going to be responsible for:

1. Initialize a session
2. Storing the session in our database
3. Set cookie equal to session id
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

initPassport(app);


app.post('/api/login', passport.authenticate('local'), async (req, res) => {
    console.log("You loggedin!!!");
    res.json("You loggedin!!!");
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

/*

The view count route responds with the number of times the user has visited the page during a given session.
It's also being stored in the database.

 */

app.get("/view-count", (req, res) => {

    if(req.session.viewCount) {
        req.session.viewCount++;
    } else {
        req.session.viewCount = 1;
    }

    console.log(req.session.viewCount);

    res.send(`You have visited this page ${req.session.viewCount} times during this session`);

});

app.get("/protected-route", isAuthenticated, async (req, res) => {
    res.send("You are authenticated!!!");
});

app.get('/api/user', isAuthenticated, async (req, res) => {
    res.send({ user: req.user});
});

app.get('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send({error:"Internal Server Error"})
        }
    });
    res.redirect("/");
});

const server = app.listen( port, () => {
    console.log("Server started at port " + address);
});