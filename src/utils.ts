import type { CollectionsResponse, PagesDomNodes } from "./schema.js";
import lodash from "lodash";

export const findCollectionByDisplayName = (
  collectionResponse: CollectionsResponse,
  displayName: string
): { id: string; isNew: false } | null => {
  const collection = collectionResponse.collections.find(
    (collection) => collection.displayName === displayName
  );
  return collection ? { id: collection.id, isNew: false } : null;
};

export const extractTextFromNodes = (nodes: PagesDomNodes): string[] => {
  return lodash
    .flattenDeep(nodes)
    .filter(({ type, text }) => type === "text" && text?.text)
    .map(({ text }) => text!.text!);
};
