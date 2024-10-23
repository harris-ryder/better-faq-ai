import lodash from "lodash";
import dotenv from "dotenv";
import { getWebflowPaginatiomItems, WebflowApiRequest, } from "./webflow-utils.js";
import { Webflow } from "webflow-api";
import { openAIApiRequest } from "./openai.js";
dotenv.config();
const { OPENAI_API_KEY, WEBFLOW_TOKEN } = process.env;
const webflowToken = WEBFLOW_TOKEN;
let collectionId = null;
const collectionDisplayName = "better-faqs";
const collectionSingularName = "better-faq";
// Rate limiter
// Webhooks
// Question: How to handle errors
(async () => {
    const { sites: [{ id: siteId }], } = await WebflowApiRequest({
        // Question:Stuck with the <any>...Am I supposed to write the structure of the response object??
        path: `/v2/sites`,
        token: webflowToken,
    });
    console.log({ siteId });
    // List pages
    const pages = await getWebflowPaginatiomItems({
        path: `/v2/sites/${siteId}/pages`,
        token: webflowToken,
        iterableObject: "pages",
    });
    console.log(pages.length);
    // Get Dom nodes
    const pagesDomNodes = await Promise.all(pages.map(async ({ id: pageId }) => await getWebflowPaginatiomItems({
        path: `/v2/pages/${pageId}/dom`,
        token: webflowToken,
        iterableObject: "nodes",
    })));
    // Get array of text extracted from dom nodes
    const pagesText = lodash
        .flattenDeep(pagesDomNodes)
        .filter(({ type }) => type === "text")
        .map(({ text: { text } }) => text);
    console.log({ pagesText });
    // Check if faq named collection exists
    const { collections } = await WebflowApiRequest({
        path: `/v2/sites/${siteId}/collections`,
        token: webflowToken,
    });
    const faqCollection = collections.find((collection) => collection.displayName === collectionDisplayName);
    collectionId = faqCollection ? faqCollection.id : null;
    console.log({ collectionId });
    // Generate fresh faqs by calling openai
    const { responses } = await openAIApiRequest(pagesText);
    console.log(responses);
    // If collectionId null create a new collection
    if (!collectionId) {
        const newCollection = await WebflowApiRequest({
            path: `/v2/sites/${siteId}/collections`,
            token: webflowToken,
            body: {
                displayName: collectionDisplayName,
                singularName: collectionSingularName,
            },
        });
        console.log("newCollection", newCollection.id);
        const questionField = await WebflowApiRequest({
            path: `/v2/collections/${newCollection.id}/fields`,
            token: webflowToken,
            body: {
                type: Webflow.FieldType.PlainText,
                displayName: "question",
                isRequired: true,
            },
        });
        const answerField = await WebflowApiRequest({
            path: `/v2/collections/${newCollection.id}/fields`,
            token: webflowToken,
            body: {
                type: Webflow.FieldType.PlainText,
                displayName: "answer",
                isRequired: true,
            },
        });
        // Create items
        let counter = 0;
        for (const faq of responses) {
            console.log(faq.question);
            console.log(faq.answer);
            await WebflowApiRequest({
                path: `/v2/collections/${newCollection.id}/items`,
                token: webflowToken,
                body: {
                    fieldData: {
                        name: faq.question,
                        question: faq.question,
                        answer: faq.answer,
                    },
                },
            });
            console.log("---------------");
            if (counter > 40) {
                await new Promise((resolve) => setTimeout(resolve, 60000));
                counter = 0;
            }
            counter++;
        }
    }
})();
//# sourceMappingURL=index.js.map