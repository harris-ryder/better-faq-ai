import lodash from "lodash";
export const findCollectionByDisplayName = (collectionResponse, displayName) => {
    const collection = collectionResponse.collections.find((collection) => collection.displayName === displayName);
    return collection ? { id: collection.id, isNew: false } : null;
};
export const extractTextFromNodes = (nodes) => {
    return lodash
        .flattenDeep(nodes)
        .filter(({ type, text }) => type === "text" && text?.text)
        .map(({ text }) => text.text);
};
//# sourceMappingURL=utils.js.map