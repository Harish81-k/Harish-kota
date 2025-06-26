// MERN Stack Code for HouseHunt – Full Example

// ========================
// Backend: server/server.js
// ========================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// =============================
// Backend: models/User.js
// =============================
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["renter", "owner", "admin"], default: "renter" },
  approved: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);


// =============================
// Backend: models/Property.js
// =============================
const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  rent: Number,
  location: String,
  bedrooms: Number,
  images: [String],
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Property", propertySchema);


// =============================
// Backend: models/Booking.js
// =============================
const bookingSchema = new mongoose.Schema({
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" },
  message: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);


// =============================
// Backend: routes/userRoutes.js
// =============================
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json(user);
});

module.exports = router;


// =============================
// Backend: routes/propertyRoutes.js
// =============================
const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

router.post("/add", async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
});

module.exports = router;


// =============================
// Backend: routes/bookingRoutes.js
// =============================
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

router.post("/request", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const bookings = await Booking.find().populate("renterId").populate("propertyId");
  res.json(bookings);
});

module.exports = router;


// =============================
// Frontend: client/src/App.js
// =============================
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;


// =============================
// Frontend: client/src/pages/Home.js
// =============================
import React from "react";

const Home = () => {
  return (
    <div className="container mt-5">
      <h1>Welcome to HouseHunt</h1>
      <p>Find your perfect rental home today.</p>
    </div>
  );
};

export default Home;


// =============================
// Frontend: client/src/pages/Register.js
// =============================
import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "renter" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/users/register", formData);
    alert("Registered successfully");
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-4">
      <h2>Register</h2>
      <input className="form-control my-2" type="text" placeholder="Name" onChange={e => setFormData({ ...formData, name: e.target.value })} />
      <input className="form-control my-2" type="email" placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} />
      <input className="form-control my-2" type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} />
      <select className="frworm-control my-2" onChange={e => setFormData({ ...formData, role: e.target.value })}>
        <option value="renter">Renter</option>
        <option value="owner">Owner</option>
      </select>
      <button className="btn btn-primary" type="submit">Register</button>
    </form>
  );
};

export default Register;
