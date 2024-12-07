import dotenv from "dotenv";
import { WEBFLOW_API_URL } from "./constants.js";
dotenv.config();
const { WEBFLOW_TOKEN } = process.env;
export const getWebflowPaginatiomItems = async (params) => {
    const offset = params.offset || 0;
    const data = await WebflowApiRequest({
        // path: `/v2/sites/${params.siteId}/pages?offset=${offset}`,
        path: `${params.path}?offset=${offset}`,
        token: params.token,
    });
    if (data[params.iterableObject].length + data.pagination.offset <
        data.pagination.total) {
        return [
            ...data[params.iterableObject],
            ...(await getWebflowPaginatiomItems({
                ...params,
                offset: offset + data.pagination.limit,
            })),
        ];
    }
    return data[params.iterableObject];
};
export const WebflowApiRequest = async (params) => {
    const { path, token, body } = params;
    const method = params.method || (body ? "post" : "get");
    const url = `${WEBFLOW_API_URL}${path}`;
    const response = await fetch(url, {
        method,
        body: typeof body === "object" ? JSON.stringify(body) : body,
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
            "accept-version": "1.0.0",
        },
    });
    if (response.status >= 400) {
        if (response.status === 401) {
            throw new Error(`Unauthorized`);
        }
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const results = await response.json();
    return results;
};
//   const results = await response.json();
//   checkError(results);
//   return results as T;
// };
// // Error handling
// interface WebflowResponseError {
//   err?: string;
//   error?: string;
//   message?: string;
// }
// const isError = (results: object): results is WebflowResponseError =>
//   "err" in results || "error" in results;
// export const checkError = (results: object): void => {
//   if (!isError(results)) {
//     return;
//   }
//   const error = results.err || results.error || results.message;
//   if (error) {
//     // logger.error({ results, error });
//     throw new Error(`webflow api error ${JSON.stringify(error)}`);
//   }
// };
//# sourceMappingURL=webflow.js.map