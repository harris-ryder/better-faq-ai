import lodash from "lodash";
import dotenv from "dotenv";
import {
  getWebflowPaginatiomItems,
  WebflowApiRequest,
} from "./webflow-utils.js";
import { Webflow } from "webflow-api";
dotenv.config();

const { OPENAI_API_KEY, WEBFLOW_TOKEN } = process.env;
const webflowToken = WEBFLOW_TOKEN as string;
let collectionId = null;
const collectionDisplayName = "better-faqs";
const collectionSingularName = "better-faq";

// Rate limiter
// Webhooks
// Question: How to handle errors

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

  const faqCollection = collections.find(
    (collection: { displayName: string }) =>
      collection.displayName === collectionDisplayName
  );
  collectionId = faqCollection ? faqCollection.id : null;
  console.log({ collectionId });

  // Generate fresh faqs by calling openai
  // const faqs = await openAIApiRequest(pagesText);
  // console.log(faqs);

  // If collectionId null create a new collection
  if (!collectionId) {
    const { newCollectionId } = await WebflowApiRequest<any>({
      path: `/v2/sites/${siteId}/collections`,
      token: webflowToken,
      body: {
        displayName: collectionDisplayName,
        singularName: collectionSingularName,
      },
    });
    console.log("newCollection", newCollectionId);

    const answerFieldId = await WebflowApiRequest<any>({
      path: `/v2/collections/${newCollectionId}/fields`,
      token: webflowToken,
      body: {
        type: Webflow.FieldType.PlainText,
        displayName: "question",
        isRequired: true,
      },
    });
    console.log("ho", answerFieldId);
  }
})();
