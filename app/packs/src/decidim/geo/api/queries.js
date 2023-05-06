const NodesFragment = `
    id
    title {
      translation(locale: "en")
    }
`

const MeetingsFragment = `
  meetings {
    nodes {
      ${NodesFragment}
      description {
        translation(locale: "en")
      }
      coordinates {
        latitude
        longitude
      }
    }
  }
`

const DebatesFragment = `
  debates {
    nodes {
      ${NodesFragment}
      description {
        translation(locale: "en")
      }
    }
  }
`

const ProposalsFragment = `
  proposals {
    nodes {
      ${NodesFragment}
      coordinates {
        latitude
        longitude
      }
    }
  }
`

export const participatoryProcesses = `
  query participatoryProcessesQuery ($filter: ParticipatoryProcessFilter) {
    participatoryProcesses(filter: $filter) { 
      slug
      bannerImage
      title {
        translation(locale: "en")
      }
      shortDescription {
        translation(locale: "en")
      }  
      components(filter: {type: "Meetings"}) {
        id
        __typename
        ... on Meetings {
          ${MeetingsFragment}
        }
        ... on Debates {
          ${DebatesFragment}
        }
        ... on Proposals {
          ${ProposalsFragment}
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
