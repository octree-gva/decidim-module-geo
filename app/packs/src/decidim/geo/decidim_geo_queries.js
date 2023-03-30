export const participatoryProcessesQuery = `{  
  participatoryProcesses {
    slug
    bannerImage
    title {
      translation(locale: "en")
    }
    components(filter: {type: "Meetings"}) {
      id
      __typename
      ... on Meetings {
        meetings {
          nodes {
            id
            title {
              translation(locale: "en")
            }
            description {
              translation(locale: "en")
            }
            coordinates {
              latitude
              longitude
            }
          }
        }
      }
    }
  }
}`;

export const shapefilesQuery = `{
  geoShapefiles {
    id
    title
    description
    shapefile
    createdAt
    updatedAt
  } 
}`

export const shapedataQuery = `{
  geoShapedata {
    id
    data
    geom
  }
}`