import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const port = process.env.PORT || 5000;
dotenv.config();

const app = express();

/* ----------------------------------------------------------------------------
                        middleware
------------------------------------------------------------------------------*/

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB connection error", err));

const userCollection = mongoose.model("User", {
  email: String,
  password: String,
  name: String,
});

/* ---------------------------------------------------------------------------
                         JWT Token Verify
-----------------------------------------------------------------------------*/

const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  next();
};

/* ---------------------------------------------------------------------------
                         Register Api 
-----------------------------------------------------------------------------*/

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  const existsUser = await userCollection.findOne({ email });
  if (existsUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  //   Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  //   create new user
  const user = new userCollection({
    email,
    password: hashPassword,
    name,
  });

  await user.save();

  // genarate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.status(201).json({
    message: "Registration Succesfully",
    email: user.email,
    id: user._id,
    name: user.name,
    token,
  });
});

/* ---------------------------------------------------------------------------
                         Login Api 
-----------------------------------------------------------------------------*/

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userCollection.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "user not found",
    });
  }

  // check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      message: "Password not matched",
    });
  }

  // genarate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.json({
    message: "Login Successfully",
    token,
    email: user.email,
    name: user.name,
  });
});

/* ---------------------------------------------------------------------------
                       GET  Register Api 
-----------------------------------------------------------------------------*/
app.get("/register", async (req, res) => {
  const users = await userCollection.find();

  res.json({
    result: users,
  });
});

/* ---------------------------------------------------------------------------
                         Home Api 
-----------------------------------------------------------------------------*/

app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    message: "Welcome to todo api",
    time: new Date(),
  });
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});

export default app;
