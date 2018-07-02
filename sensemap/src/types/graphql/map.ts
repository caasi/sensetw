import { MapID, MapType, MapData } from '../sense/map';
import { client } from './client';
import * as moment from 'moment';

const graphQLMapFieldsFragment = `
  fragment mapFields on Map {
    id, createdAt, updatedAt, type, name, description, tags, image
  }`;

interface GraphQLMapFields {
  id:          string;
  type:        string;
  createdAt:   string;
  updatedAt:   string;
  name:        string;
  description: string;
  tags:        string;
  image:       string;
}

const toMapData: (m: GraphQLMapFields) => MapData =
  m => ({
    id:          m.id,
    type:        MapType[m.type],
    createdAt:   +moment(m.createdAt),
    updatedAt:   +moment(m.updatedAt),
    name:        m.name || '',
    description: m.description || '',
    tags:        m.tags || '',
    image:       m.image || '',
  });

export const loadMaps =
  () => {
    const query = `
      query AllMaps {
        allMaps {
          ...mapFields
        }
      }
      ${graphQLMapFieldsFragment}
    `;
    return client.request(query)
      .then(({ allMaps }) => allMaps.map(toMapData));
  };

export const create =
  (map: MapData) => {
    const query = `
      mutation CreateMap($type: String, $name: String, $description: String, $tags: String, $image: String) {
        createMap(type: $type, name: $name, description: $description, tags: $tags, image: $image) {
          ...mapFields
        }
      }
      ${graphQLMapFieldsFragment}
    `;
    return client.request(query, map)
      .then(({ createMap }) => toMapData(createMap));
  };

export const update =
  (map: MapData) => {
    const query = `
      mutation UpdateMap($id: ID!, $type: String, $name: String, $description: String, $tags: String, $image: String) {
        updateMap(id: $id, type: $type, name: $name, description: $description, tags: $tags, image: $image) {
          ...mapFields
        }
      }
      ${graphQLMapFieldsFragment}
    `;
    return client.request(query, map)
      .then(({ updateMap }) => toMapData(updateMap));
  };

export const remove =
  (mapID: MapID) => {
    const query = `
      mutation DeleteMap($mapID: ID!) {
        deleteMap(id: $mapID) { ...mapFields }
      }
      ${graphQLMapFieldsFragment}
    `;
    const variables = { mapID };
    return client.request(query, variables)
      .then(({ deleteMap }) => toMapData(deleteMap));
  };