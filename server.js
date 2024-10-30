const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const databaseConnect = require("./config/database");
const routes = require("./routes/v1");
const cookieParser = require("cookie-parser");
const { MONGO_URI, SECRET_KEY, REACT_APP_FRONTEND_URL } = require("./config");

const bookingReminder = require("./cronJobs/bookingReminder");
const startPropertyUpdaterCron = require("./cronJobs/aiCleanup");
const bodyParser = require('body-parser');
const { createWhatsAppGroup, sendMessageToGroup, startWhatsAppClient, getQRCode } = require('./utils/whatsappService');
const app = express();
require("./config/passport");

// app.use(
//   cors({
//     origin: REACT_APP_FRONTEND_URL,
//     credentials: true,
//   })
// );
const allowedOrigins = [
  "http://localhost:8080",
  "https://beleef.com.au",
  "https://www.beleef.com.au",
  "https://admin.beleef.com.au",
  "https://www.admin.beleef.com.au",
  "https://search.beleef.com.au",
  "https://www.search.beleef.com.au"
];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
      
//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );
// CORS Middleware (applies only to routes other than the webhook)
app.use((req, res, next) => {
  // Skip CORS for /webhooks/campaignAgent
  if (req.path.startsWith("/api/v1/webhooks/campaignAgent")) {
    return next();
  }
  
  // Apply CORS for other routes
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })(req, res, next);
});

app.use(express.json({ limit: "50mb" }));

app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions", // Ensure the collection name is correctly defined
      autoRemove: "native", // Automatically remove expired sessions
      stringify: false, // Avoids issues with saving undefined or null values as strings
    }),
    cookie: {
      secure: false, // Use secure: true if using HTTPS
      // maxAge: 7*24 * 60 * 60 * 1000, // Set the session to expire after 30 minutes (in milliseconds)
      maxAge: 1 * 60 * 60 * 1000, // Set the session to expire after 1 hour (in milliseconds)
    },
  })
);

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  const html = `
      <html>
          <head>
              <title>Welcome home</title>
          </head>
          <body>
              <h1>Welcome to Beleef Backend APIs</h1>
              <p>This is backend page</p>
          </body>
      </html>
  `;
  res.send(html);
});

// Starting WhatsApp Authentication when server starts

// startWhatsAppClient()
//   .then(() => {
//     console.log('WhatsApp Client is ready.');
//     app.listen(PORT, () => {
//       console.log(`Server is running`);
//     });
//   })
//   .catch((error) => {
//     console.error('Error starting WhatsApp Client:', error);
//   });
// API Endpoint to create a WhatsApp Group


app.use(bodyParser.json());

startWhatsAppClient()
  .then(() => {
    console.log('WhatsApp Client is ready.');
  })
  .catch((error) => {
    console.error('Error starting WhatsApp Client:', error);
  });

app.post('/create-group', async (req, res) => {
  const { groupName, participants } = req.body;

  if (!groupName || !participants) {
    return res.status(400).send({ error: 'Group name and participants are required.' });
  }

  try {
    const response = await createWhatsAppGroup(groupName, participants);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// API Endpoint to send a message to a WhatsApp Group
app.post('/send-group-message', async (req, res) => {
  const { groupId, message } = req.body;

  // Use lastCreatedGroupId if no groupId is provided
  const targetGroupId = groupId || lastCreatedGroupId;

  if (!targetGroupId || !message) {
    return res.status(400).send({ error: 'Group ID and message are required.' });
  }

  try {
    const response = await sendMessageToGroup(targetGroupId, message);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Endpoint to get QR code
app.get('/get-qr-code', (req, res) => {
  const qrCode = getQRCode();
  if (qrCode) {
    res.status(200).send({ qrCode });
  } else {
    res.status(404).send({ error: 'QR code not available' });
  }
});

databaseConnect();
bookingReminder();

// startPropertyUpdaterCron()

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
