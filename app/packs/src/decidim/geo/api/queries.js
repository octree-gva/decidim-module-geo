import makeQuery from "./makeQuery";
export const _getGeoDataSource = makeQuery("geoDatasource");
export const _getGeoDataSourceIds = makeQuery("geoDatasourceIds", "geoDatasource");

export const getGeoConfig = makeQuery("geoConfig");
export const getGeoScopes = makeQuery("geoScope");
