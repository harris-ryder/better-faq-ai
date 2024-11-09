import axios from "axios";
import dotenv from "dotenv";
import { WEBFLOW_API_URL } from "./constants.js";
import { Webflow } from "webflow-api";
import {
  WebflowPaginationResponse,
  webflowPaginationResponseSchema,
  collectionsSchema,
  CollectionsResponse,
  CollectionResponse,
  collectionSchema,
  FieldSchemaResponse,
  fieldSchema,
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

// todo: use async.io queue to process one at a time per token (not global)
// read x-ratelimit-remaining header and if is bellow e.g 5, pause for {retry-after} header secs
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

  const rateLimitRemaining = parseInt(
    response.headers.get("x-ratelimit-remaining") || "0"
  );
  console.log(`Remaining rate limit: ${rateLimitRemaining}`);

  if (response.status >= 400) {
    if (response.status === 401) {
      throw new Error(`Unauthorized`);
    }
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  const results = await response.json();
  return results as T;
};

// this needs to be a function getCollectionId
// if the collection doesn't exist, create it
// return the id
// note: always return early
interface getCollectionIdParams {
  siteId: string;
  webflowToken: string;
  collectionDisplayName?: string;
  collectionSingularName?: string;
}
export const getCollectionId = async ({
  siteId,
  webflowToken,
  collectionDisplayName = "better-faqs",
  collectionSingularName = "better-faq",
}: getCollectionIdParams): Promise<{ id: string; isNew: boolean }> => {
  /**
   * Grab collections for specific site -> Find "better-faqs" and return
   */
  const { collections } = await WebflowApiRequest<{
    collections: CollectionsResponse;
  }>({
    path: `/v2/sites/${siteId}/collections`,
    token: webflowToken,
  });
  const validatedCollections = collectionsSchema.parse(collections);

  const faqCollection = validatedCollections.find(
    (collection: { displayName: string }) =>
      collection.displayName === collectionDisplayName
  );

  let collectionId = faqCollection ? faqCollection.id : null;

  if (collectionId) return { id: collectionId, isNew: false };

  /**
   * If "better-faqs" doesn't exist then create it
   */
  const newCollection = await WebflowApiRequest<CollectionResponse>({
    path: `/v2/sites/${siteId}/collections`,
    token: webflowToken,
    body: {
      displayName: collectionDisplayName,
      singularName: collectionSingularName,
    },
  });
  const validatedNewCollection = collectionSchema.parse(newCollection);
  collectionId = validatedNewCollection.id;

  // todo: include this is in getcollection
  const questionField = await WebflowApiRequest<FieldSchemaResponse>({
    path: `/v2/collections/${newCollection.id}/fields`,
    token: webflowToken,
    body: {
      type: Webflow.FieldType.PlainText,
      displayName: "question",
      isRequired: true,
    },
  });
  const validatedQuestionField = fieldSchema.parse(questionField);

  const answerField = await WebflowApiRequest<FieldSchemaResponse>({
    path: `/v2/collections/${newCollection.id}/fields`,
    token: webflowToken,
    body: {
      type: Webflow.FieldType.PlainText,
      displayName: "answer",
      isRequired: true,
    },
  });
  const validatedAnswerField = fieldSchema.parse(answerField);

  return { id: collectionId, isNew: true };
};
