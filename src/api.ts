import {
  pagesDomNodesSchema,
  PagesResponse,
  pagesResponseSchema,
  SitesResponse,
  sitesResponseSchema,
} from "./schema.js";
import {
  getWebflowPaginationItems,
  WebflowApiRequest,
} from "./webflow-utils.js";

export const getSiteId = async (webflowToken: string): Promise<string> => {
  const response = await WebflowApiRequest<SitesResponse>({
    path: `/v2/sites`,
    token: webflowToken,
  });
  // Extract first Site Id
  const {
    sites: [{ id: siteId }],
  } = sitesResponseSchema.parse(response);

  return siteId;
};

export const getSitePages = async (
  siteId: string,
  webflowToken: string
): Promise<PagesResponse> => {
  const pages = await getWebflowPaginationItems({
    path: `/v2/sites/${siteId}/pages`,
    token: webflowToken,
    iterableObject: "pages",
  });
  return pagesResponseSchema.parse(pages);
};

export const getPagesNodes = async (
  sitePages: PagesResponse,
  webflowToken: string
) => {
  const pagesDomNodes = await Promise.all(
    sitePages.map(
      async ({ id: pageId }: any) =>
        await getWebflowPaginationItems({
          path: `/v2/pages/${pageId}/dom`,
          token: webflowToken,
          iterableObject: "nodes",
        })
    )
  );
  return pagesDomNodesSchema.parse(pagesDomNodes);
};

export const postBulkItems = async (
  collectionId: string,
  faqList: { question: string; answer: string }[],
  webflowToken: string
) => {
  await WebflowApiRequest<any>({
    path: `/v2/collections/${collectionId}/items/bulk`,
    token: webflowToken,
    body: {
      fieldData: faqList.map((response) => ({
        name: response.question,
        ...response,
      })),
    },
  });
};
