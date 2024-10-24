import lodash from "lodash";
import dotenv from "dotenv";
import {
  getCollectionId,
  getWebflowPaginatiomItems,
  WebflowApiRequest,
} from "./webflow-utils.js";
import { Webflow } from "webflow-api";
import { openAIApiRequest } from "./openai.js";
dotenv.config();

const { WEBFLOW_TOKEN } = process.env;
const webflowToken = WEBFLOW_TOKEN as string;

// Rate limiter
// Webhooks
// Question: How to handle errors
// Zod for schema
// Write unit tests

(async () => {
  const {
    sites: [{ id: siteId }],
  } = await WebflowApiRequest<any>({
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

  const collection = await getCollectionId({ siteId, webflowToken });

  console.log({ collection });

  // const { responses } = await openAIApiRequest(pagesText);
  // console.log(responses);

  // let counter = 0;
  // for (const faq of responses) {
  //   console.log(faq.question);
  //   console.log(faq.answer);

  //   await WebflowApiRequest<any>({
  //     path: `/v2/collections/${newCollection.id}/items`,
  //     token: webflowToken,
  //     body: {
  //       fieldData: {
  //         name: faq.question,
  //         question: faq.question,
  //         answer: faq.answer,
  //       },
  //     },
  //   });

  //   console.log("---------------");
  //   if (counter > 40) {
  //     await new Promise((resolve) => setTimeout(resolve, 60000));
  //     counter = 0;
  //   }
  //   counter++;
  // }
})();
