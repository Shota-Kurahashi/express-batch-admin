export type HasEpisodeWork = {
  id: number;
  series_title: string;
  tid: number;
  title: string;
};

export type ResultData = {
  TID: number;
  end_time: string;
  number: number;
  start_time: string;
  title: string;
};

export type TvFeed = {
  "tv:endDatetime": string;
  "tv:genre": string;
  "tv:iepgUrl": string;
  "tv:performer": string;
  "tv:startDatetime": string;
};

export type Item = {
  "dc:date": string;
  "dc:publisher": string;
  description: string;
  link: string;
  title: string;
  "tv:feed": TvFeed;
};

type Episode = {
  has_next_episode: boolean;
  has_prev_episode: boolean;
  id: string;
  number: number;
  title: string;
  work_id: number;
};

export type ALLEpisodes = {
  episodes: Episode[];
};
