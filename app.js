const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const authRouter = require("./routers/authRouter");
const contactsRouter = require("./routers/contactsRouter");
const chatRoomRouter = require("./routers/chatRoomRouter");
const profileRouter = require("./routers/profileRouter");
const uploadRouter = require("./routers/uploadRouter");
const ReqError = require("./utilities/ReqError");
const errorController = require("./controllers/errorController");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
}));

// ========== DEBUG MIDDLEWARE ==========
app.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('📦 Cookies:', req.cookies);
  next();
});

// ========== PUBLIC ROUTES ==========
// Test endpoints
app.get("/", (req, res) => {
  res.json({ 
    message: "Telegram Clone API",
    publicEndpoints: ["/api/test", "/api/health", "/api/user/login", "/api/user/register"]
  });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", public: true });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", public: true });
});

// Authentication routes - MUST BE PUBLIC
app.use("/api/user", authRouter);

// ========== AUTH MIDDLEWARE ==========
// Create separate middleware function
const requireAuth = (req, res, next) => {
  console.log(`🔐 Auth check for: ${req.originalUrl}`);
  
  // Define ALL public routes
  const publicRoutes = [
    '/',
    '/api/test',
    '/api/health',
    '/api/user/login',
    '/api/user/register',
    '/api/user/logout'
  ];
  
  // Check if current route starts with any public route
  const isPublic = publicRoutes.some(route => {
    // Exact match
    if (req.originalUrl === route) return true;
    // Starts with route (for nested paths like /api/user/login)
    if (req.originalUrl.startsWith(route)) return true;
    return false;
  });
  
  console.log(`📝 Is public route? ${isPublic}`);
  console.log(`📝 User ID cookie: ${req.cookies.userId ? 'Present' : 'Missing'}`);
  
  if (isPublic) {
    console.log('✅ Skipping auth for public route');
    return next();
  }
  
  if (!req.cookies.userId) {
    console.log('❌ Auth failed - no userId cookie');
    return next(new ReqError(401, "Authentication required. Please log in."));
  }
  
  console.log('✅ Auth passed');
  next();
};

// Apply auth middleware to all routes
app.use(requireAuth);

// ========== PROTECTED ROUTES ==========
app.use("/api/contacts", contactsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/chatRoom", chatRoomRouter);
app.use("/api/upload", uploadRouter);

// ========== ERROR HANDLER ==========
app.use(errorController);

module.exports = app;