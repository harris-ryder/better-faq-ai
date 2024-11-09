import lodash from "lodash";
import dotenv from "dotenv";
import {
  collectionItemsResponse,
  collectionItemsResponseSchema,
  openAIFaqSchema,
  PageDomNodes,
  pagesDomNodesSchema,
  PagesResponse,
  pagesResponseSchema,
  SitesResponse,
  sitesResponseSchema,
} from "./schema.js";
import { openAIApiRequest } from "./openai.js";
import { postBulkItems, findOrCreateCollection } from "./api.js";
import {
  getWebflowPaginationItems,
  WebflowApiRequest,
} from "./webflow-utils.js";
import { extractTextFromNodes } from "./utils.js";
dotenv.config();

const { WEBFLOW_TOKEN } = process.env;
const webflowToken = WEBFLOW_TOKEN as string;

// Rate limiter
// Webhooks
// Question: How to handle errors
// Write unit tests

(async () => {
  const siteId = sitesResponseSchema.parse(
    await WebflowApiRequest<SitesResponse>({
      path: `/v2/sites`,
      token: webflowToken,
    })
  ).sites[0].id;

  const sitePages = pagesResponseSchema.parse(
    await getWebflowPaginationItems<PagesResponse>({
      path: `/v2/sites/${siteId}/pages`,
      token: webflowToken,
      iterableObject: "pages",
    })
  );

  const pagesNodes = pagesDomNodesSchema.parse(
    await Promise.all(
      sitePages.map(({ id: pageId }: { id: string }) =>
        getWebflowPaginationItems<PageDomNodes>({
          path: `/v2/pages/${pageId}/dom`,
          token: webflowToken,
          iterableObject: "nodes",
        })
      )
    )
  );

  const collection = await findOrCreateCollection({ siteId, webflowToken });

  // If CMS already exists, delete existing items
  if (!collection.isNew) {
    const collectionItems = collectionItemsResponseSchema.parse(
      await getWebflowPaginationItems<collectionItemsResponse>({
        path: `/v2/collections/${collection.id}/items`,
        token: webflowToken,
        iterableObject: "items",
      })
    );

    const collectionItemIds = collectionItems.map(({ id }) => {
      return { id };
    });

    await WebflowApiRequest<any>({
      path: `/v2/collections/${collection.id}/items`,
      token: webflowToken,
      method: "DELETE",
      body: {
        items: collectionItemIds,
      },
    });
  }

  // Generate OpenAI faqs
  const pagesText = extractTextFromNodes(pagesNodes);

  // Call OpenAI
  const { responses: validatedResponses } = openAIFaqSchema.parse(
    await openAIApiRequest(pagesText)
  );

  // Post AI Faqs to CMS
  postBulkItems(collection.id, validatedResponses, webflowToken);
})();
