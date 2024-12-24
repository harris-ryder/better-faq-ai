import { Webflow } from "webflow-api";
import type {
  CollectionResponse,
  CollectionsResponse,
  FieldSchemaResponse,
} from "./schema.ts";
import {
  collectionSchema,
  collectionsResponseSchema,
  fieldSchema,
} from "./schema.ts";
import { WebflowApiRequest } from "./webflow-utils.ts";
import { findCollectionByDisplayName } from "./utils.ts";

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

interface getCollectionIdParams {
  siteId: string;
  webflowToken: string;
  collectionDisplayName?: string;
  collectionSingularName?: string;
}
export const findOrCreateCollection = async ({
  siteId,
  webflowToken,
  collectionDisplayName = "better-faqs",
  collectionSingularName = "better-faq",
}: getCollectionIdParams): Promise<{ id: string; isNew: boolean }> => {
  const collections = collectionsResponseSchema.parse(
    await WebflowApiRequest<{
      collections: CollectionsResponse;
    }>({
      path: `/v2/sites/${siteId}/collections`,
      token: webflowToken,
    })
  );

  const existingCollection = findCollectionByDisplayName(
    collections,
    collectionDisplayName
  );
  if (existingCollection) return existingCollection;

  const newCollection = collectionSchema.parse(
    await WebflowApiRequest<CollectionResponse>({
      path: `/v2/sites/${siteId}/collections`,
      token: webflowToken,
      body: {
        displayName: collectionDisplayName,
        singularName: collectionSingularName,
      },
    })
  );

  const questionField = fieldSchema.parse(
    await WebflowApiRequest<FieldSchemaResponse>({
      path: `/v2/collections/${newCollection.id}/fields`,
      token: webflowToken,
      body: {
        type: Webflow.FieldType.PlainText,
        displayName: "question",
        isRequired: true,
      },
    })
  );

  const answerField = fieldSchema.parse(
    await WebflowApiRequest<FieldSchemaResponse>({
      path: `/v2/collections/${newCollection.id}/fields`,
      token: webflowToken,
      body: {
        type: Webflow.FieldType.PlainText,
        displayName: "answer",
        isRequired: true,
      },
    })
  );

  return { id: newCollection.id, isNew: true };
};
