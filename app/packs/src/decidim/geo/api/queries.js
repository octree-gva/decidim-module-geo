export const geoDatasource = `
  query geoDatasourceQuery ($locale: String!, $filters: [GeoDatasourceFilter!], $after: String) {
    geoDatasource(filters: $filters, locale: $locale, after: $after){
      pageInfo {
        hasPreviousPage
        startCursor
        endCursor
        hasNextPage
      }
      nodes {
        id
        link
        participatorySpaceId
        participatorySpaceType
        componentId
        type
        startTime
        endTime
        title{
          translation(locale: $locale)
        }
        shortDescription {
          translation(locale: $locale)
        }
        description {
          translation(locale: $locale)
        }
        bannerImage
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
export const geoDatasourceIds = `
  query geoDatasourceQueryIds ($locale: String!, $filters: [GeoDatasourceFilter!], $after: String) {
    geoDatasource(filters: $filters, locale: $locale, after: $after){
      pageInfo {
        hasPreviousPage
        startCursor
        endCursor
        hasNextPage
      }
      nodes {
        id
        type
      }
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
