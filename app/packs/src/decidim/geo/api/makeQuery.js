import * as queries from "./gql";
import { getDecidimData } from "../utils";
import configStore from "../stores/configStore";
const makeQuery =
  (queryName, responseKey = undefined) =>
  async (params = {}) => {
    const _responseKey = responseKey ? responseKey : queryName;
    const { locale, defaultLocale } = configStore.getState();
    const variables = { ...(params.variables || {}), locale, defaultLocale };
    const queryParams = { ...params, variables };
    const response = await getDecidimData(queries[queryName], queryParams);
    if (!response?.data) return { nodes: [] };
    return response.data[_responseKey];
  };

export default makeQuery;
