const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/profiles", require("./routes/profiles"));

connectDB();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
