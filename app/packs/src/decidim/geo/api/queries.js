export const participatoryProcesses = `{  
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
    lat 
    lng 
    zoom 
  }
}`;

export const geoShapedata = `{
  geoShapedata {
    id
    data
    geom
  }
}`;

export const geoScope = `{
  geoScope { 
    id
    name	{ 
      translation(locale: "en") 
    }
    geom
  }
}`;
