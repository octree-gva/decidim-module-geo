export const participatoryProcessesQuery = `{  
  participatoryProcesses {
    slug
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
  shapefiles {
    id
    title
    description
    shapefile
    createdAt
  } 
}`