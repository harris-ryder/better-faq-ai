import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const { WEBFLOW_API_URL, WEBFLOW_TOKEN } = process.env;
export const getWebflowPages = async (params) => {
    const offset = params.offset || 0;
    const { data } = await axios.get(`${WEBFLOW_API_URL}/v2/sites/${params.siteId}/pages?offset=${offset}`, {
        headers: {
            Authorization: `Bearer ${WEBFLOW_TOKEN}`,
        },
    });
    if (data.pages.length + data.pagination.offset < data.pagination.total) {
        return [
            ...data.pages,
            ...(await getWebflowPages({
                ...params,
                offset: offset + data.pagination.limit,
            })),
        ];
    }
    return data.pages;
};
export const webflowApiRequest = async (params) => {
    //   logger.trace(`sending webflow api request to ${params.path}`);
    //   const remainingPoints = await rateLimiterQueue.removeTokens(1, params.token);
    //   logger.trace(
    //     `webflowApiRequest: token ${params.token} has ${remainingPoints} remaining points`
    //   );
    const { path, token, body } = params;
    const method = params.method || (body ? "post" : "get");
    const url = `${WEBFLOW_API_URL}${path}`;
    const response = await fetch(url, {
        method,
        body: typeof body === "object" ? JSON.stringify(body) : body,
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${WEBFLOW_TOKEN}`,
            "accept-version": "1.0.0",
        },
        // timeout: 60_000,
    });
    if (response.status >= 400) {
        if (response.status === 401) {
            //   const site = await knex("sites")
            //     .where({ webflow_token: params.token })
            //     .first();
            //   if (!site) {
            //     throw new Error(`webflowApiRequest site not found`);
            //   }
        }
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const results = await response.json();
    checkError(results);
    return results;
};
const isError = (results) => "err" in results || "error" in results;
export const checkError = (results) => {
    if (!isError(results)) {
        return;
    }
    const error = results.err || results.error || results.message;
    if (error) {
        // logger.error({ results, error });
        throw new Error(`webflow api error ${JSON.stringify(error)}`);
    }
};
//# sourceMappingURL=utils.js.map