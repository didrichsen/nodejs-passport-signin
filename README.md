# nodejs-passport-login-server

I wanted to explore how to use passport js to create a login server. 
So that's what I did. 

I created a simple login server using passport js with the strategy of local (email/username & password).

## How to use

Create a .env file in the server folder and add the following variables:
- MONGODB=<your_mongodb_connection_string>
- SUPER_SECRET_SECRET=<your_super_secret_session_key>

Then run the following commands within server:

- npm install to install all dependencies. 
- npm run dev to start the server.

## What to look at

- The server.js file contains session implementation. 
- The passport-js.js file (config folder) contains the passport implementation.

## Comments and descriptions

- For my own, and maybe someone else's, educational purposes, I have commented most of the code and 
tried to explain what is going on and how passport works behind the scenes.

## Future updates and improvements

- At some point I will add more passport strategies and each branch will then contain a different strategy.

