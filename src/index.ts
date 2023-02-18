/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
import * as dotenv from "dotenv";
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
