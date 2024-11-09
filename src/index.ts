import lodash from "lodash";
import dotenv from "dotenv";
import { getCollectionId } from "./webflow-utils.js";
import { openAIFaqSchema } from "./schema.js";
import { openAIApiRequest } from "./openai.js";
import {
  getPagesNodes,
  getSiteId,
  getSitePages,
  postBulkItems,
} from "./api.js";
dotenv.config();

const { WEBFLOW_TOKEN } = process.env;
const webflowToken = WEBFLOW_TOKEN as string;

// Rate limiter
// Webhooks
// Question: How to handle errors
// Write unit tests

(async () => {
  const siteId = await getSiteId(webflowToken);
  const sitePages = await getSitePages(siteId, webflowToken);
  const pagesNodes = await getPagesNodes(sitePages, webflowToken);

  // Early exit if an faq collection exists
  const collection = await getCollectionId({ siteId, webflowToken });
  if (!collection.isNew) return;

  // Generate OpenAI faqs
  const pagesText = lodash
    .flattenDeep(pagesNodes)
    .filter(({ type, text }) => type === "text")
    .map(({ text }) => text!.text); // Err Feel a bit off wih this

  const responses = await openAIApiRequest(pagesText);
  const { responses: validatedResponses } = openAIFaqSchema.parse(responses);

  // Post AI Faqs to CMS
  postBulkItems(collection.id, validatedResponses, webflowToken);
})();
