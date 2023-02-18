/* eslint-disable import/no-extraneous-dependencies */
import * as dotenv from "dotenv";
import express from "express";
import { scheduleJob } from "node-schedule";

dotenv.config();

scheduleJob("30 * * * * *", () => {
  const date = new Date();
  console.log(date);
});

const app = express();

app.get("/", (_, res) => {
  res.send("Hello world");
});

app.listen(3005, () => console.log("Server is running"));
