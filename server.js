// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// ----------------------------
// MongoDB Connection
// ----------------------------
mongoose.set('strictQuery', false);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));


// ----------------------------
// Mongoose Models
// ----------------------------
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});
const User = mongoose.model('User', UserSchema);

const CourseSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  code: String
});
const Course = mongoose.model('Course', CourseSchema);


// ----------------------------
// JWT Auth Middleware
// ----------------------------
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET); // { id, email }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


// ----------------------------
// API ROUTES
// ----------------------------

// REGISTER -------------------
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN ----------------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const passwordOK = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOK)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET ALL COURSES ------------
app.get("/api/courses", async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});


// ENROLL IN COURSE -----------
app.post("/api/enroll", authMiddleware, async (req, res) => {
  const { courseId } = req.body;
  if (!courseId)
    return res.status(400).json({ message: "courseId is required" });

  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    user.enrolledCourses.push(courseId);
    await user.save();

    res.json({ message: "Successfully enrolled" });
  } catch (err) {
    console.error("Enroll error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET CURRENT USER PROFILE ---
app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("enrolledCourses");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      enrolledCourses: user.enrolledCourses
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ----------------------------
// FRONTEND FALLBACK
// ----------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ----------------------------
// START SERVER
// ----------------------------
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
