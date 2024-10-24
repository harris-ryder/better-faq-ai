import dotenv from "dotenv";
import { WEBFLOW_API_URL } from "./constants.js";
import { Webflow } from "webflow-api";
dotenv.config();
const { WEBFLOW_TOKEN } = process.env;
export const getWebflowPaginatiomItems = async (params) => {
    const offset = params.offset || 0;
    const data = await WebflowApiRequest({
        // path: `/v2/sites/${params.siteId}/pages?offset=${offset}`,
        path: `${params.path}?offset=${offset}`,
        token: params.token,
    });
    if (data[params.iterableObject].length + data.pagination.offset <
        data.pagination.total) {
        return [
            ...data[params.iterableObject],
            ...(await getWebflowPaginatiomItems({
                ...params,
                offset: offset + data.pagination.limit,
            })),
        ];
    }
    return data[params.iterableObject];
};
// todo: use async.io queue to process one at a time per token (not global)
// read x-ratelimit-remaining header and if is bellow e.g 5, pause for {retry-after} header secs
export const WebflowApiRequest = async (params) => {
    const { path, token, body } = params;
    const method = params.method || (body ? "post" : "get");
    const url = `${WEBFLOW_API_URL}${path}`;
    const response = await fetch(url, {
        method,
        body: typeof body === "object" ? JSON.stringify(body) : body,
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
            "accept-version": "1.0.0",
        },
    });
    if (response.status >= 400) {
        if (response.status === 401) {
            throw new Error(`Unauthorized`);
        }
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const results = await response.json();
    return results;
};
export const getCollectionId = async ({ siteId, webflowToken, collectionDisplayName = "better-faqs", collectionSingularName = "better-faq", }) => {
    const { collections } = await WebflowApiRequest({
        path: `/v2/sites/${siteId}/collections`,
        token: webflowToken,
    });
    const faqCollection = collections.find((collection) => collection.displayName === collectionDisplayName);
    let collectionId = faqCollection ? faqCollection.id : null;
    console.log({ collectionId });
    if (collectionId)
        return { id: collectionId, isNew: false };
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
        collectionId = newCollection.id;
        // todo: include this is in getcollection
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
    }
    return { id: collectionId, isNew: true };
};
//# sourceMappingURL=webflow-utils.js.map