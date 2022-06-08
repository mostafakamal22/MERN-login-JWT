require("dotenv").config();
const express = require("express");
const Cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();

app.use(Cors());

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(console.log("mogoose is connected"))
  .catch((err) => {
    console.error(err);
  });

app.get("/", (req, res) => {
  res.json("hello world");
});

app.post("/api/register", async (req, res) => {
  const newPassword = await bcrypt.hash(req.body.password, 10);
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: newPassword,
    });
    res.json(user);
  } catch (err) {
    res.json("wrong user");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.json({ err: "invalid email" });
    }
    const isPasswordValid = bcrypt.compare(req.body.password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign(
        { name: user.name, email: user.email },
        "secret123"
      );
      res.json({ status: "ok, login..", token });
    } else {
      res.json("not found user");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/qoute", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    const user = await User.findOne({ email: email });

    res.json({ qoute: user });
  } catch (error) {
    console.log(error);
    res.json({ err: error });
  }
});

app.post("/api/qoute", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    const user = await User.updateOne(
      { email: email },
      { $set: { qoute: req.body.qoute } }
    );

    res.json({ status: "qoute has been recorded" });
  } catch (error) {
    console.log(error);
    res.json({ err: error });
  }
});

app.listen(4000, () => console.log("server is running"));
