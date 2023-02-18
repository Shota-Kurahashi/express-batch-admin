/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
import * as dotenv from "dotenv";
import express from "express";
import { scheduleJob } from "node-schedule";
import { createAllEpisodes } from "src/createAllEpisodes";
import { updateEpisodes } from "src/hooks";

dotenv.config();

scheduleJob("46 20 * * * *", async () => {
  try {
    await createAllEpisodes();
    await updateEpisodes();
    console.log("success");
  } catch {
    console.error("error");
    throw new Error("error");
  }
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: any, res: any) => {
  try {
    res.send({ name: "hoge" });
  } catch (error) {
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000);
export default app;
