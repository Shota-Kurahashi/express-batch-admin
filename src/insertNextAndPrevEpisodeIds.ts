/* eslint-disable import/extensions */
import { GraphQLClient } from "graphql-request";
import { INSERT_NEXT_PREV_EPISODE_IDS } from "./graphql/query";
import { getInsertNextAndPrevEpisodeIdData } from "./hooks";

export const insertNextAndPrevEpisodeIds = async () => {
  const insertData = await getInsertNextAndPrevEpisodeIdData();
  const client = new GraphQLClient(process.env.ENDPOINT as string, {
    headers: {
      "x-hasura-admin-secret": process.env.ADMIN_SECRET as string,
    },
  });

  try {
    await client.request(INSERT_NEXT_PREV_EPISODE_IDS, {
      episodes: insertData,
    });
  } catch (e) {
    throw new Error(e);
  }
};
