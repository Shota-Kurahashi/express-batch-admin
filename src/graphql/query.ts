/* eslint-disable import/no-extraneous-dependencies */
import { gql } from "graphql-request";

export const GET_HAS_TID_WORKS = gql`
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

export const MUTATE_EPISODES = gql`
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

export const UPDATE_TODAY_EPISODE = gql`
  mutation UpdateTodayEpisode(
    $tid: Int!
    $number: Int!
    $episodes_set_input: episodes_set_input!
  ) {
    update_episodes(
      where: {
        _and: { number: { _eq: $number }, work: { tid: { _eq: $tid } } }
      }
      _set: $episodes_set_input
    ) {
      returning {
        id
        start_time
        end_time
      }
    }
  }
`;
