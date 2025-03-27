const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("./config/passport");

dotenv.config();

const app = express();
const server = createServer(app); // Use HTTP server for WebSockets
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.FRONTEND_URL,
    failureRedirect: "/auth/failure",
  })
);

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout error");
    res.redirect(process.env.FRONTEND_URL);
  });
});

// WebSocket for Real-Time Collaboration
let documentContent = ""; // Store the latest document state

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Send current document content to the newly connected user
  socket.emit("load-document", documentContent);

  // Listen for content changes
  socket.on("update-document", (newContent) => {
    documentContent = newContent;
    socket.broadcast.emit("receive-document", newContent);
  });

  socket.on("disconnect", () => {
    console.log("⚡ User disconnected:", socket.id);
  });
});

// Start server
server.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5001}`);
});
