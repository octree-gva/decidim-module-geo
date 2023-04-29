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
