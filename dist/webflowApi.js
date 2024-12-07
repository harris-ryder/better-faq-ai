import { WEBFLOW_API_URL } from "./constants";
import { webflowPaginationResponseSchema, } from "./schema";
import { z } from "zod";
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
    /**
     * Webflow 60 req/min checker
     */
    const rateLimitRemaining = parseInt(response.headers.get("x-ratelimit-remaining") || "0");
    console.log(`Remaining rate limit: ${rateLimitRemaining}`);
    if (rateLimitRemaining < 5) {
        console.log("Close to rate limit, pausing for 60 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
    }
    if (response.status >= 400) {
        if (response.status === 401) {
            throw new Error(`Unauthorized`);
        }
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    if (method === "DELETE") {
        console.log("Deleted items");
        return "deleted items";
    }
    const results = await response.json();
    return results;
};
export const getWebflowPaginationItems = async (params) => {
    const offset = params.offset || 0;
    const rawData = await WebflowApiRequest({
        path: `${params.path}?offset=${offset}`,
        token: params.token,
    });
    const data = webflowPaginationResponseSchema.parse(rawData);
    if (data[params.iterableObject].length + data.pagination.offset <
        data.pagination.total) {
        return [
            ...data[params.iterableObject],
            ...(await getWebflowPaginationItems({
                ...params,
                offset: offset + data.pagination.limit,
            })),
        ];
    }
    return data[params.iterableObject];
};
export const getWebflowCmsItemParamsSchema = z.object({
    collectionId: z.string(),
    accessToken: z.string(),
});
export const collectionItemSchema = z.object({
    id: z.string(),
    cmsLocaleId: z.string(),
    lastPublished: z.string().nullable(),
    lastUpdated: z.string(),
    createdOn: z.string(),
    isArchived: z.boolean(),
    isDraft: z.boolean(),
    fieldData: z.object({}),
});
export const getWeblfowCmsItems = async (_params) => {
    const { collectionId, accessToken } = getWebflowCmsItemParamsSchema.parse(_params);
    const results = await getWebflowPaginationItems({
        path: `/v2/collections/${collectionId}/items`,
        token: accessToken,
        iterableObject: "items",
    });
    return collectionItemSchema.array().parse(results);
};
//# sourceMappingURL=webflowApi.js.map