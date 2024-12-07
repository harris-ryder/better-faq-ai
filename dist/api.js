import { Webflow } from "webflow-api";
import { collectionSchema, collectionsResponseSchema, fieldSchema, } from "./schema.js";
import { WebflowApiRequest } from "./webflow-utils.js";
import { findCollectionByDisplayName } from "./utils.js";
export const postBulkItems = async (collectionId, faqList, webflowToken) => {
    await WebflowApiRequest({
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
export const findOrCreateCollection = async ({ siteId, webflowToken, collectionDisplayName = "better-faqs", collectionSingularName = "better-faq", }) => {
    const collections = collectionsResponseSchema.parse(await WebflowApiRequest({
        path: `/v2/sites/${siteId}/collections`,
        token: webflowToken,
    }));
    const existingCollection = findCollectionByDisplayName(collections, collectionDisplayName);
    if (existingCollection)
        return existingCollection;
    const newCollection = collectionSchema.parse(await WebflowApiRequest({
        path: `/v2/sites/${siteId}/collections`,
        token: webflowToken,
        body: {
            displayName: collectionDisplayName,
            singularName: collectionSingularName,
        },
    }));
    const questionField = fieldSchema.parse(await WebflowApiRequest({
        path: `/v2/collections/${newCollection.id}/fields`,
        token: webflowToken,
        body: {
            type: Webflow.FieldType.PlainText,
            displayName: "question",
            isRequired: true,
        },
    }));
    const answerField = fieldSchema.parse(await WebflowApiRequest({
        path: `/v2/collections/${newCollection.id}/fields`,
        token: webflowToken,
        body: {
            type: Webflow.FieldType.PlainText,
            displayName: "answer",
            isRequired: true,
        },
    }));
    return { id: newCollection.id, isNew: true };
};
//# sourceMappingURL=api.js.map