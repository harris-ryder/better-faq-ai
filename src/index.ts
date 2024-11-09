import lodash from "lodash";
import dotenv from "dotenv";
import {
  openAIFaqSchema,
  pagesDomNodesSchema,
  pagesResponseSchema,
  SitesResponse,
} from "./schema.js";
import { openAIApiRequest } from "./openai.js";
import { postBulkItems, findOrCreateCollection } from "./api.js";
import {
  getWebflowPaginationItems,
  WebflowApiRequest,
} from "./webflow-utils.js";
dotenv.config();

const { WEBFLOW_TOKEN } = process.env;
const webflowToken = WEBFLOW_TOKEN as string;

// Rate limiter
// Webhooks
// Question: How to handle errors
// Write unit tests

(async () => {
  const siteId = (
    await WebflowApiRequest<SitesResponse>({
      path: `/v2/sites`,
      token: webflowToken,
    })
  ).sites[0].id;

  const sitePages = pagesResponseSchema.parse(
    await getWebflowPaginationItems({
      path: `/v2/sites/${siteId}/pages`,
      token: webflowToken,
      iterableObject: "pages",
    })
  );

  const pagesNodes = pagesDomNodesSchema.parse(
    await Promise.all(
      sitePages.map(({ id: pageId }: any) =>
        getWebflowPaginationItems({
          path: `/v2/pages/${pageId}/dom`,
          token: webflowToken,
          iterableObject: "nodes",
        })
      )
    )
  );

  // Early exit if an faq collection exists
  const collection = await findOrCreateCollection({ siteId, webflowToken });
  if (!collection.isNew) return;

  // Generate OpenAI faqs
  const pagesText = lodash
    .flattenDeep(pagesNodes)
    .filter(({ type, text }) => type === "text")
    .map(({ text }) => text!.text); // Err Feel a bit off wih this

  // Call OpenAI
  const { responses: validatedResponses } = openAIFaqSchema.parse(
    await openAIApiRequest(pagesText)
  );

  // Post AI Faqs to CMS
  postBulkItems(collection.id, validatedResponses, webflowToken);
})();
