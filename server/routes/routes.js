import passport from "passport";
import {isAuthenticated, isAdmin} from "../lib/authMiddleware.js";
import {genPassword} from "../lib/passwordUtils.js";
import express from "express";
import {connection} from "../config/database.js";

const router = express.Router();

/*
    Just a simple login form.
 */

router.get("/login", (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Login Form</title>
            </head>
            <body>
                <h2>Login Form</h2>
                <form action="/login" method="POST">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="uname" required><br><br>
                    
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="pwd" required><br><br>
                    
                    <button type="submit">Login</button>
                </form>
            </body>
        </html>
    `);
});


/*
    This route is called when the user submits the login form.
    passport.authenticate is a middleware that will call the verifyCallback function
    defined in server/config/passport-js.js. Local is passed as the strategy to use.

 */

router.post('/login', passport.authenticate('local'), async (req, res) => {
    res.json("You logged in successfully! :)");
});

/*
    Base URL rendering welcome message depending on whether the user is logged in or not.
 */

router.get("/", (req, res) => {
    if(req.user){
        res.send(`
            <html>
                <head>
                    <title>Home Page</title>
                </head>
                <body>
                    <h2>Welcome, logged in as: ${req.user.username}</h2>
                    <a href="/logout">Logout</a>
                </body>
            </html>
        `);

    } else {
        res.send(`
            <html>
                <head>
                    <title>Home Page</title>
                </head>
                <body>
                    <h2>Welcome, not logged in.</h2>
                    <a href="/login">Login</a>
                </body>
            </html>
        `);
    }
});

/*
    The view count route prints the number of times the user has visited the page during a given session.
    Illustrates how a property can be added to the session object.
 */

router.get("/view-count", (req, res) => {

    if(req.session.viewCount) {
        req.session.viewCount++;
    } else {
        req.session.viewCount = 1;
    }

    console.log(req.session.viewCount);

    res.send(`You have visited this page ${req.session.viewCount} times during this session`);

});

/*
    This route is protected. The isAuthenticated middleware will check if the user is authenticated.
    If the user is authenticated, the user will be able to access the protected route.
    If the user is not authenticated, the user will be redirected to the base URL.

 */

router.get("/protected-route", isAuthenticated, async (req, res) => {
    res.send("You are authenticated!!!");
});

/*
    Route for registering a new user.
 */

router.post('/register', async (req, res) => {

    const saltHash = genPassword(req.body.pwd);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = {
        username: req.body.uname,
        role: req.body.role,
        hash: hash,
        salt: salt
    };

    try {
        const result = await connection.db("passport-js").collection("users").insertOne(newUser);
        res.status(201).send({id: result.insertedId});
    } catch (err) {
        console.error(err);
        res.status(500).send({error: "Internal Server Error"});
    }

});

/*
    Another protected route.
 */

router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
    res.send({ user: req.user});
});

/*
    Logout route. This route will log the user out by calling req.logout().
    req.logout() is a function added by passport to the request object.
    It will remove the user property from the session object and remove the req.user object.

 */

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send({error:"Internal Server Error"})
        }
    });
    res.redirect("/");
});

export default router;