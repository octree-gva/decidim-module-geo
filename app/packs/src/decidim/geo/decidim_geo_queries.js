let lang = "en"
const $html = (document.getElementsByTagName("html") || [])[0];
if($html)
  lang = $html.attributes.lang.value;

export const participatoryProcessesQuery = `{  
  participatoryProcesses {
    slug
    title {
      translation(locale: "${lang}")
    }
    components(filter: {type: "Meetings"}) {
      id
      __typename
      ... on Meetings {
        meetings {
          nodes {
            id
            title {
              translation(locale: "${lang}")
            }
            description {
              translation(locale: "${lang}")
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