export const geoDatasource = `
 query geoDatasourceQuery ($defaultLocale: String!, $locale: String!, $isIndex: Boolean, $filters: [GeoDatasourceFilter!], $after: String) {
    geoDatasource(filters: $filters, locale: $locale, after: $after, isIndex: $isIndex, first: 50){
      pageInfo {
        hasPreviousPage
        startCursor
        endCursor
        hasNextPage
      }
      nodes {
        id
        link:resourceUrl
        participatorySpaceId
        participatorySpaceType
        componentId
        type:resourceType
        startTime:startDate
        endTime:startDate
        title{
          translation(locale: $locale)
          defaultTranslation: translation(locale: $defaultLocale)
        }
        shortDescription {
          translation(locale: $locale)
          defaultTranslation: translation(locale: $defaultLocale)
        }
        description:descriptionHtml {
          translation(locale: $locale)
          defaultTranslation: translation(locale: $defaultLocale)
        }
        bannerImage:imageUrl
        coordinates{
          latitude
          longitude
        }
        scopeId:geoScopeId
      }
    }
  }`;
export const geoDatasourceIds = `
  query geoDatasourceQueryIds ($locale: String!, $filters: [GeoDatasourceFilter!], $isIndex: Boolean, $after: String) {
    geoDatasource(filters: $filters, locale: $locale, after: $after, isIndex: $isIndex, first: 50){
      pageInfo {
        hasPreviousPage
        startCursor
        endCursor
        hasNextPage
      }
      nodes {
        id
        type:resourceType
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
