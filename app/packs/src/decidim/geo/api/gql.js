export const geoDatasource = `
  query geoDatasourceQuery ($defaultLocale: String!, $locale: String!, $filters: [GeoDatasourceFilter!], $after: String) {
    geoDatasource(filters: $filters, locale: $locale, after: $after, first: 500){
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
          defaultTranslation: translation(locale: $defaultLocale)
        }
        shortDescription {
          translation(locale: $locale)
          defaultTranslation: translation(locale: $defaultLocale)
        }
        description {
          translation(locale: $locale)
          defaultTranslation: translation(locale: $defaultLocale)
        }
        bannerImage
        coordinates{
          latitude
          longitude
        }
        scope {
          id
          name {
            translation(locale: $locale)
            defaultTranslation: translation(locale: $defaultLocale)
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
  query geoScopeQuery ($defaultLocale: String!, $locale: String!) {
    geoScope { 
      id
      name	{ 
        translation(locale: $locale)
        defaultTranslation: translation(locale: $defaultLocale)
      }
      geom
    }
  }
`;
