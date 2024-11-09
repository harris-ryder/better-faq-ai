import axios from "axios";
import dotenv from "dotenv";
import { WEBFLOW_API_URL } from "./constants.js";
import { Webflow } from "webflow-api";
import {
  WebflowPaginationResponse,
  webflowPaginationResponseSchema,
} from "./schema.js";
dotenv.config();

// Recursively call site pages
interface getWebflowCmsItemsParams {
  token: string;
  offset?: number;
  batchSize?: number;
  path: string;
  iterableObject: string;
}

export const getWebflowPaginationItems = async <T>(
  params: getWebflowCmsItemsParams
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

// Webflow api request function
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
  const results = await response.json();
  return results as T;
};
