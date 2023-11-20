export const geoDatasource = `
  query geoDatasourceQuery ($locale: String!, $filters: [GeoDatasourceFilter!], $first: Int) {
    geoDatasource(filters: $filters, locale: $locale, first: $first){
      pageInfo {
        hasPreviousPage
        startCursor
        endCursor
        hasNextPage
      }
      nodes {
        id
        participatorySpaceId
        participatorySpaceType
        componentId
        type
        title{
          translation(locale: $locale)
        }
        shortDescription {
          translation(locale: $locale)
        }
        description {
          translation(locale: $locale)
        }
        coordinates{
          latitude
          longitude
        }
        scope {
          id
          name {
            translation(locale: "en")
          }
        }
      }
    }
  }`;

export const geoShapefiles = `{
  geoShapefiles {
    id
    title
    description
    shapefile
    createdAt
    updatedAt
  } 
}`;

export const shapedata = `{
  geoShapedata {
    id
    data
    geom
  }
}`;

export const geoConfig = `{
  geoConfig { 
    latitude 
    longitude 
    zoom 
    tile
  }
}`;

export const geoShapedata = `{
  geoShapedata {
    id
    data
    geom
  }
}`;

export const geoScope = `
  query geoScopeQuery ($locale: String!) {
    geoScope { 
      id
      name	{ 
        translation(locale: $locale) 
      }
      geom
    }
  }
`;
