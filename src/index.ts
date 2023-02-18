/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
import { parse } from "csv-parse/sync";
import * as dotenv from "dotenv";
import express from "express";
import { gql, GraphQLClient } from "graphql-request";
import { scheduleJob } from "node-schedule";

const sliceByNumber = (array: string[]) => {
  const length = Math.ceil(array.length / 2);

  return new Array(length)
    .fill(null)
    .map((_, i) => array.slice(i * 2, (i + 1) * 2));
};

const MUTATE_EPISODES = gql`
  mutation MutateEpisodes($episodes: [episodes_insert_input!]!) {
    insert_episodes(
      objects: $episodes
      on_conflict: { constraint: episodes_work_id_number_key }
    ) {
      returning {
        created_at
      }
    }
  }
`;

dotenv.config();

type HasEpisodeWork = {
  id: number;
  series_title: string;
  tid: number;
  title: string;
};

const GET_HAS_TID_WORKS = gql`
  query GetHasTidWorks {
    works(where: { tid: { _is_null: false } }) {
      id
      title
      tid
      series_title
      media_type_id
    }
  }
`;

scheduleJob("** * * * * *", () => {
  const date = new Date();
  console.log(date);
});

const app = express();

app.get("/", async (_, res) => {
  const getEpisodes = async () => {
    const client = new GraphQLClient(process.env.ENDPOINT as string);
    const data = await fetch(process.env.CSV_ENDPOINT as string).then((r) =>
      r.text()
    );

    const hasTidWorks: HasEpisodeWork[] = await client
      .request(GET_HAS_TID_WORKS)
      .then((r) => r.works);

    const records: string[][] = parse(data);

    const datas = records.map((record) => {
      const tid = +record[0];
      const title = record[1];
      const episodes = record[2];

      return {
        episodes,
        tid,
        title,
      };
    });

    const hasEpisodes = datas.filter(
      (record, index) => record.episodes !== "" && index !== 0
    );

    const spilitEpisodesData = hasEpisodes
      .map((record) => {
        const { episodes, tid } = record;

        const splitEpisodes = episodes.trim().split("*").slice(1);

        const tidData = hasTidWorks?.find(
          (work: HasEpisodeWork) => work.tid === tid
        );

        // TODO nullのやつはworkに入ってない
        if (tidData === undefined) return null;

        return {
          splitEpisodes,
          tid: tidData?.tid,
          work_id: tidData?.id,
        };
      })
      .filter((item) => item !== null);

    const resultEpisodesData = spilitEpisodesData
      .map((item) => {
        if (item === null) return null;

        return {
          splitEpisodes: sliceByNumber(item.splitEpisodes),
          tid: item.tid,
          work_id: item.work_id,
        };
      })
      .filter((item) => item !== null);
    return resultEpisodesData;
  };

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
    const data = await client.request(MUTATE_EPISODES, {
      episodes: result,
    });
    res.json(data);
  } catch (e) {
    res.json(e);
  }
});

app.listen(3005, () => console.log("url: http://localhost:3005"));
