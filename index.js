import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let userID = "";

mongoose
  .connect(
    "mongodb+srv://warekarqais:login@assignment.uys3fdy.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
    }
  )
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String, required: true },
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      // bcrypt.compare(password, user.password, function (err, result) {
      //   if (err) {
      //     res.status(500).send("Something went wrong");
      //   }
        if (user.password === password) {
          res.status(200).send("User logged in successfully");
          userID = user._id;
        } else {
          res.send("Password is incorrect");
        }
      })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Something went wrong");
    })
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email: email })
    .then(async (user) => {
      if (user) {
        res.status(500).send("User already exists");
      } else {
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
          name,
          email,
          password,
        });
        user
          .save()
          .then(() => {
            res.status(200).send("User registered successfully");
            userID = user._id;
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Something went wrong");
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Something went wrong");
    });
});

app.post("/logout", (req, res) => {
  userID = null;
  res.status(200).send("User logged out successfully");
});

app.get("/profile", (req, res) => {
  if (userID) {
    User.findById(userID)
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Something went wrong");
      });
  } else {
    res.send("User not logged in");
  }
});

app.post("/profile/:userID", (req, res) => {
  const { userID } = req.params;
  const { name, email, password } = req.body;
  User.findOne({ _id: userID }).then((user) => {
    if (user) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      user.name = name;
      user.email = email;
      user.password = password;
      user
        .save()
        .then(() => {
          res.status(200).send("User updated successfully");
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send("Something went wrong");
        });
    } else {
      res.send("Could not find user");
    }
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

const User = mongoose.model("user", userSchema);
export default User;