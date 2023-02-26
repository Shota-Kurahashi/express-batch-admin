/* eslint-disable import/extensions */
/* eslint-disable no-promise-executor-return */
/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import axios from "axios";
import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";
import { GraphQLClient } from "graphql-request";
import {
  GET_ALL_EPISODES,
  GET_HAS_TID_WORKS,
  UPDATE_TODAY_EPISODE,
} from "../graphql/query";
import { ALLEpisodes, HasEpisodeWork, Item, ResultData } from "../types";

export const sliceByNumber = (array: string[]) => {
  const length = Math.ceil(array.length / 2);

  return new Array(length)
    .fill(null)
    .map((_, i) => array.slice(i * 2, (i + 1) * 2));
};

export const getEpisodes = async () => {
  const client = new GraphQLClient(process.env.ENDPOINT as string, {
    headers: {
      "x-hasura-admin-secret": process.env.ADMIN_SECRET as string,
    },
  });
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

export const parseXml = (data: string) => {
  const todayDatas: ResultData[] = [];
  const parser = new XMLParser();
  const xmlDoc = parser.parse(data);
  const items: Item[] = xmlDoc["rdf:RDF"].item;

  items.forEach((item) => {
    const titleTag = item.title;
    const splitTitleTag = titleTag?.split(";");
    const TID = splitTitleTag?.[splitTitleTag.length - 1];
    const titleAndNumber = splitTitleTag?.[0].split(" ");
    const number = titleAndNumber?.[0].replace("#", "");
    const title = titleAndNumber?.slice(1).join(" ");
    const start_time = item["tv:feed"]["tv:startDatetime"];
    const end_time = item["tv:feed"]["tv:endDatetime"];

    if (
      !TID ||
      !number ||
      !title?.trim() ||
      Number.isNaN(Number(number)) ||
      !start_time ||
      !end_time ||
      !Number.isInteger(Number(number))
    )
      return;

    const isInclude = todayDatas?.some((resultData) => resultData.TID === +TID);

    if (isInclude) return;

    todayDatas.push({
      TID: +TID,
      end_time,
      number: +number,
      start_time,
      title: title.replace("「", "").replace("」", ""),
    });
  });

  return todayDatas;
};

export const updateEpisodes = async () => {
  const URL = process.env.SHOBOI_ENDOPOINT as string;
  const data = await axios.get(URL).then((response) => response.data);
  const todatData = parseXml(data);

  const client = new GraphQLClient(process.env.ENDPOINT as string, {
    headers: {
      "x-hasura-admin-secret": process.env.ADMIN_SECRET as string,
    },
  });

  try {
    await Promise.all(
      todatData.map(async (item, index) => {
        if (index % 60 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 90000));
        }
        const result = await client.request(UPDATE_TODAY_EPISODE, {
          episodes_set_input: {
            end_time: item.end_time,
            start_time: item.start_time,
          },
          number: item.number,
          tid: item.TID,
        });

        return result;
      })
    );
  } catch (e) {
    throw new Error(e);
  }
};

export const getAllEpisodes = async () => {
  const client = new GraphQLClient(process.env.ENDPOINT as string, {
    headers: {
      "x-hasura-admin-secret": process.env.ADMIN_SECRET as string,
    },
  });

  const data = await client.request<ALLEpisodes>(GET_ALL_EPISODES);

  return data;
};

export const getInsertNextAndPrevEpisodeIdData = async () => {
  const allEpisodes = await getAllEpisodes();

  const insertData = allEpisodes.episodes.map((episode) => {
    const { has_next_episode, has_prev_episode, work_id, number, title } =
      episode;

    const nextEpisode = allEpisodes.episodes.find(
      (item) => item.work_id === work_id && item.number === number + 1
    );

    const prevEpisode = allEpisodes.episodes.find(
      (item) => item.work_id === work_id && item.number === number - 1
    );

    if (has_next_episode && has_prev_episode && nextEpisode && prevEpisode) {
      return {
        has_next_episode,
        has_prev_episode,
        next_episode_id: nextEpisode?.id,
        number,
        prev_episode_id: prevEpisode?.id,
        title,
        work_id,
      };
    }

    if (has_next_episode && nextEpisode) {
      return {
        has_next_episode,
        has_prev_episode,
        next_episode_id: nextEpisode?.id,
        number,
        prev_episode_id: null,
        title,
        work_id,
      };
    }

    if (has_prev_episode && prevEpisode) {
      return {
        has_next_episode,
        has_prev_episode,
        next_episode_id: null,
        number,
        prev_episode_id: prevEpisode?.id,
        title,
        work_id,
      };
    }

    return {
      has_next_episode,
      has_prev_episode,
      next_episode_id: null,
      number,
      prev_episode_id: null,
      title,
      work_id,
    };
  });

  return insertData;
};
