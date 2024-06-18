const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use("/api/users", require("./routes/user"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/auth", require("./routes/auth"));

connectDB();

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
