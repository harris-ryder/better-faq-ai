import { z } from "zod";
// For `/v2/sites/${siteId}/pages`
export const siteSchema = z.object({
    id: z.string(),
    displayName: z.string(),
});
export const sitesResponseSchema = z.object({
    sites: z.array(siteSchema),
});
// For `/v2/sites/${siteId}/pages`
export const pageSchema = z.object({
    id: z.string(),
});
export const pagesResponseSchema = z.array(pageSchema);
export const paginationSchema = z.object({
    offset: z.number(),
    limit: z.number(),
    total: z.number(),
});
// For getWebflowPaginationItems utils function
export const webflowPaginationResponseSchema = z
    .object({
    pagination: paginationSchema,
})
    .and(z.record(z.any()));
// For pagesDomNodes in index.ts
const domNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    text: z
        .object({
        html: z.string().nullable(),
        text: z.string().nullable(),
    })
        .optional(),
    image: z
        .object({
        alt: z.string(),
    })
        .optional(),
    attributes: z.record(z.any()).default({}),
});
const pageDomNodesSchema = z.array(domNodeSchema);
export const pagesDomNodesSchema = z.array(z.array(domNodeSchema));
// For `/v2/sites/${siteId}/collections`
const collectionFieldSchema = z.object({
    id: z.string(),
    isEditable: z.boolean(),
    isRequired: z.boolean(),
    type: z.string(),
    slug: z.string(),
    displayName: z.string(),
    helpText: z.null().or(z.string()),
    validations: z.record(z.any()),
});
export const collectionSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    singularName: z.string(),
    slug: z.string(),
    createdOn: z.string(),
    lastUpdated: z.string(),
    fields: z.array(collectionFieldSchema).optional(),
});
export const collectionsResponseSchema = z.object({
    collections: z.array(collectionSchema),
});
// For  `/v2/collections/${newCollection.id}/fields`
export const fieldSchema = z.object({
    id: z.string(),
    isEditable: z.boolean(),
    isRequired: z.boolean(),
    type: z.string(),
    slug: z.string(),
    displayName: z.string(),
    helpText: z.null(),
    validations: z.null(),
});
// For openAIResponse
export const openAIFaqSchema = z.object({
    responses: z.array(z.object({
        question: z.string(),
        answer: z.string(),
    })),
});
// For Collection Items
export const collectionItemSchema = z.object({
    id: z.string(),
    cmsLocaleId: z.string(),
    lastPublished: z.null().or(z.string()),
    lastUpdated: z.string(),
    createdOn: z.string(),
    isArchived: z.boolean(),
    isDraft: z.boolean(),
    fieldData: z.object({}),
});
export const collectionItemsResponseSchema = z.array(collectionItemSchema);
//# sourceMappingURL=schema.js.map