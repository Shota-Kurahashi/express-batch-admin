/* eslint-disable import/extensions */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
import * as dotenv from "dotenv";
import { createAllEpisodes } from "./createAllEpisodes";
import { updateEpisodes } from "./hooks";

dotenv.config();

(async () => {
  try {
    await createAllEpisodes();
    await updateEpisodes();
    console.log("success");
  } catch {
    console.error("error");
    throw new Error("error");
  }
})();
