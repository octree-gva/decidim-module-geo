const NodesFragment = `
  id
  title {
    translation(locale: $locale)
  }
`

const MeetingsFragment = `
  meetings {
    nodes {
      ${NodesFragment}
      description {
        translation(locale: $locale)
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
        translation(locale: $locale)
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
  query participatoryProcessesQuery ($filter: ParticipatoryProcessFilter, $locale: String!) {
    participatoryProcesses(filter: $filter) { 
      slug
      bannerImage
      title {
        translation(locale: $locale)
      }
      shortDescription {
        translation(locale: $locale)
      }  
      components {
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

