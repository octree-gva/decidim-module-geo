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
