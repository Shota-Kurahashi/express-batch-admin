/* eslint-disable import/extensions */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
import * as dotenv from "dotenv";
import { createAllEpisodes } from "./createAllEpisodes";
import { updateEpisodes } from "./hooks";
import { insertNextAndPrevEpisodeIds } from "./insertNextAndPrevEpisodeIds";

dotenv.config();

(async () => {
  try {
    await createAllEpisodes();
    await updateEpisodes();
    await insertNextAndPrevEpisodeIds();
  } catch (e) {
    throw new Error(e);
  }
})();
