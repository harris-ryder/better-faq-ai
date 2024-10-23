import lodash from "lodash";
import dotenv from "dotenv";
import {
  getWebflowPaginatiomItems,
  WebflowApiRequest,
} from "./webflow-utils.js";
import { Webflow } from "webflow-api";
import { openAIApiRequest } from "./openai.js";
dotenv.config();

const { OPENAI_API_KEY, WEBFLOW_TOKEN } = process.env;
const webflowToken = WEBFLOW_TOKEN as string;
const collectionDisplayName = "better-faqs";
const collectionSingularName = "better-faq";

// Rate limiter
// Webhooks
// Question: How to handle errors
// Zod for schema

(async () => {
  const {
    sites: [{ id: siteId }],
  } = await WebflowApiRequest<any>({
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
  const pagesDomNodes = await Promise.all(
    pages.map(
      async ({ id: pageId }: any) =>
        await getWebflowPaginatiomItems({
          path: `/v2/pages/${pageId}/dom`,
          token: webflowToken,
          iterableObject: "nodes",
        })
    )
  );

  // Get array of text extracted from dom nodes
  const pagesText = lodash
    .flattenDeep(pagesDomNodes)
    .filter(({ type }) => type === "text")
    .map(({ text: { text } }) => text);
  console.log({ pagesText });

  // Check if faq named collection exists
  const { collections } = await WebflowApiRequest<any>({
    path: `/v2/sites/${siteId}/collections`,
    token: webflowToken,
  });
  // this needs to be a function getCollectionId
  // if the collection doesn't exist, create it
  // return the id
  // note: always return early
  const faqCollection = collections.find(
    (collection: { displayName: string }) =>
      collection.displayName === collectionDisplayName
  );

  const collectionId = faqCollection ? faqCollection.id : null;
  console.log({ collectionId });
  // -----
  // Generate fresh faqs by calling openai

  // todo: split fn
  const { responses } = await openAIApiRequest(pagesText);
  console.log(responses);

  // If collectionId null create a new collection

  // toodo; this will be part of the get collection fn
  if (!collectionId) {
    const newCollection = await WebflowApiRequest<any>({
      path: `/v2/sites/${siteId}/collections`,
      token: webflowToken,
      body: {
        displayName: collectionDisplayName,
        singularName: collectionSingularName,
      },
    });
    console.log("newCollection", newCollection.id);

    // todo: include this is in getcollection
    const questionField = await WebflowApiRequest<any>({
      path: `/v2/collections/${newCollection.id}/fields`,
      token: webflowToken,
      body: {
        type: Webflow.FieldType.PlainText,
        displayName: "question",
        isRequired: true,
      },
    });
    const answerField = await WebflowApiRequest<any>({
      path: `/v2/collections/${newCollection.id}/fields`,
      token: webflowToken,
      body: {
        type: Webflow.FieldType.PlainText,
        displayName: "answer",
        isRequired: true,
      },
    });

    // Create items

    // this doesn't work becasue you make calls to webflow before
    // ignore rate limit for now
    let counter = 0;
    for (const faq of responses) {
      console.log(faq.question);
      console.log(faq.answer);

      await WebflowApiRequest<any>({
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
