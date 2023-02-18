/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import { GraphQLClient } from "graphql-request";
import { MUTATE_EPISODES } from "./graphql/query";
import { getEpisodes } from "./hooks";

export const createAllEpisodes = async () => {
  const records = await getEpisodes();

  const episodes = records.map((record) => {
    if (record === null) return null;

    const { splitEpisodes, work_id } = record;

    return splitEpisodes.map((episode, index) => {
      const [number, title] = episode;

      if (
        number === undefined ||
        title === undefined ||
        +number == null ||
        title === "" ||
        Number.isNaN(+number) ||
        !Number.isInteger(+number)
      )
        return null;

      if (title === "") return null;

      return {
        end_time: "2023-01-29T00:00:00.000Z",
        has_next_episode: index !== record.splitEpisodes.length - 1,
        has_prev_episode: index !== 0,
        number: +number,
        start_time: "2023-01-29T00:00:00.000Z",
        title: title
          .replace(/"/g, "")
          .replace(/'/g, "")
          .replace(/\\/g, "")
          .replace(/`/g, "")
          .replace(/\r\n/g, "")
          .trim(),
        work_id,
      };
    });
  });

  const result = episodes.flat().filter((item) => item !== null);

  const client = new GraphQLClient(process.env.ENDPOINT as string, {
    headers: {
      "x-hasura-admin-secret": process.env.ADMIN_SECRET as string,
    },
  });

  try {
    await client.request(MUTATE_EPISODES, {
      episodes: result,
    });
  } catch (e) {
    throw new Error(e);
  }
};
