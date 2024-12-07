import { WEBFLOW_API_URL } from "./constants";
import {
  WebflowPaginationResponse,
  webflowPaginationResponseSchema,
} from "./schema";
import { z } from "zod";

interface GetWebflowPaginatedParams {
  token: string;
  offset?: number;
  batchSize?: number;
  path: string;
  iterableObject: string;
}

interface WebflowApiRequestParams {
  path: string;
  token: string;
  method?: string;
  body?: Record<string, unknown>;
}

export const WebflowApiRequest = async <T>(
  params: WebflowApiRequestParams
): Promise<T> => {
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
  const rateLimitRemaining = parseInt(
    response.headers.get("x-ratelimit-remaining") || "0"
  );
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
    return "deleted items" as T;
  }
  const results = await response.json();
  return results as T;
};

export const getWebflowPaginationItems = async <T>(
  params: GetWebflowPaginatedParams
): Promise<T[]> => {
  const offset = params.offset || 0;
  const rawData = await WebflowApiRequest<WebflowPaginationResponse>({
    path: `${params.path}?offset=${offset}`,
    token: params.token,
  });
  const data = webflowPaginationResponseSchema.parse(rawData);
  if (
    data[params.iterableObject].length + data.pagination.offset <
    data.pagination.total
  ) {
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

type GetWeblfowCmsItemsResponse = z.infer<typeof collectionItemSchema>[];

export const getWeblfowCmsItems = async (
  _params: z.infer<typeof getWebflowCmsItemParamsSchema>
): Promise<GetWeblfowCmsItemsResponse> => {
  const { collectionId, accessToken } =
    getWebflowCmsItemParamsSchema.parse(_params);
  const results = await getWebflowPaginationItems<
    z.infer<typeof collectionItemSchema>
  >({
    path: `/v2/collections/${collectionId}/items`,
    token: accessToken,
    iterableObject: "items",
  });
  return collectionItemSchema.array().parse(results);
};
