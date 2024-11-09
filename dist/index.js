import lodash from "lodash";
import dotenv from "dotenv";
import { getCollectionId, getWebflowPaginationItems, WebflowApiRequest, } from "./webflow-utils.js";
import { openAIFaqSchema, pagesDomNodesSchema, pagesResponseSchema, sitesResponseSchema, } from "./schema.js";
import { openAIApiRequest } from "./openai.js";
dotenv.config();
const { WEBFLOW_TOKEN } = process.env;
const webflowToken = WEBFLOW_TOKEN;
// Rate limiter
// Webhooks
// Question: How to handle errors
// Zod for schema
// Write unit tests
(async () => {
    /**
     * List Sites -> Get First Site
     */
    const response = await WebflowApiRequest({
        path: `/v2/sites`,
        token: webflowToken,
    });
    // Extract first Site Id
    const { sites: [{ id: siteId }], } = sitesResponseSchema.parse(response);
    /**
     * List Sites -> Get First Site -> Collect Site Pages
     */
    const pages = await getWebflowPaginationItems({
        path: `/v2/sites/${siteId}/pages`,
        token: webflowToken,
        iterableObject: "pages",
    });
    let validatedPages = pagesResponseSchema.parse(pages);
    console.log(validatedPages);
    /**
     * List Sites -> Get First Site -> Collect Site Pages -> Collect all Pages Dom Nodes
     */
    const pagesDomNodes = await Promise.all(pages.map(async ({ id: pageId }) => await getWebflowPaginationItems({
        path: `/v2/pages/${pageId}/dom`,
        token: webflowToken,
        iterableObject: "nodes",
    })));
    let validatedPagesDomNodes = pagesDomNodesSchema.parse(pagesDomNodes);
    /**
     * List Sites -> Get First Site -> Collect Site Pages -> Collect all Pages Dom Nodes -> Extract Text Array
     */
    const pagesText = lodash
        .flattenDeep(validatedPagesDomNodes)
        .filter(({ type, text }) => type === "text")
        .map(({ text }) => text.text); // Err Feel a bit off wih this
    const collection = await getCollectionId({ siteId, webflowToken });
    console.log({ collection });
    // Don't create new list if collection already exists (for now)
    if (!collection.isNew)
        return;
    const responses = await openAIApiRequest(pagesText);
    const { responses: validatedResponses } = openAIFaqSchema.parse(responses);
    console.log(validatedResponses);
    const resp = await WebflowApiRequest({
        path: `/v2/collections/${collection.id}/items/bulk`,
        token: webflowToken,
        body: {
            fieldData: validatedResponses.map((response) => ({
                name: response.question, // Using question as the name field
                ...response, // Spread the rest of the response data
            })),
        },
    });
    console.log({ resp });
})();
//# sourceMappingURL=index.js.map