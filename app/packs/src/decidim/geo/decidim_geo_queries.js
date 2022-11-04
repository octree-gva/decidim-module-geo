var participatoryProcessesQuery = `{  
  participatoryProcesses {
    id
    title {
      translation(locale: "fr")
    }
    components(filter: {type: "Meetings"}) {
      id
      __typename
      ... on Meetings {
        meetings {
          nodes {
            description {
              translation(locale: "fr")
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
}`