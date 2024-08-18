const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const databaseConnect = require("./config/database");
const authRoutes = require("./routes/v1/auth");
const { MONGO_URI, SECRET_KEY } = require("./config");

const app = express();
require("./config/passport");

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use(express.json());

// app.use(session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: MONGO_URI }),
//   cookie: {
//     secure: false, // Use secure: true if using HTTPS
//     maxAge: 24 * 60 * 60 * 1000 // Set the session to expire after 1 day (in milliseconds)
//   }
// }));

app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      secure: false, // Use secure: true if using HTTPS
      maxAge: 10 * 60 * 1000, // Set the session to expire after 10 minute (in milliseconds)
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Example logging in middleware to track session IDs
app.use((req, res, next) => {
  console.log("Session ID in middleware:", req.sessionID);
  next();
});

app.use("/api/v1/auth", authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  const html = `
      <html>
          <head>
              <title>Welcome</title>
          </head>
          <body>
              <h1>Welcome to Beleef Backend APIs</h1>
              <p>This is backend page.</p>
          </body>
      </html>
  `;
  res.send(html);
});

databaseConnect();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
