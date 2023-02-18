import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("Hello world");
});

app.listen(3005, () => console.log("Server is running"));
