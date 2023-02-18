import express from "express";
import schedule from "node-schedule";

const app = express();

app.get("/", (_, res) => {
  schedule.scheduleJob("1 * * * * *", () => {
    const date = new Date();
    console.log(`hh:mm:30に実行します${date}`);
  });
  res.send("Hello world");
});

app.listen(3005, () => console.log("Server is running"));
