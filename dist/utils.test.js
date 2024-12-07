import { describe, it } from "node:test";
import assert from "node:assert";
import { findCollectionByDisplayName, extractTextFromNodes } from "./utils.js";
describe("findCollectionByDisplayName", () => {
    it("should return collection id when display name matches", () => {
        const mockCollections = {
            collections: [
                {
                    id: "123",
                    displayName: "test-collection",
                    singularName: "test",
                    slug: "test",
                    createdOn: "2024-01-01",
                    lastUpdated: "2024-01-01",
                },
            ],
        };
        const result = findCollectionByDisplayName(mockCollections, "test-collection");
        assert.deepStrictEqual(result, { id: "123", isNew: false });
    });
    it("should return null when display name doesn't match", () => {
        const mockCollections = {
            collections: [
                {
                    id: "123",
                    displayName: "test-collection",
                    singularName: "test",
                    slug: "test",
                    createdOn: "2024-01-01",
                    lastUpdated: "2024-01-01",
                },
            ],
        };
        const result = findCollectionByDisplayName(mockCollections, "non-existent");
        assert.strictEqual(result, null);
    });
    it("should return null for empty collections", () => {
        const mockCollections = {
            collections: [],
        };
        const result = findCollectionByDisplayName(mockCollections, "test-collection");
        assert.strictEqual(result, null);
    });
});
describe("extractTextFromNodes", () => {
    it("should extract text from valid text nodes", () => {
        const mockNodes = [
            [
                {
                    id: "1",
                    type: "text",
                    text: {
                        html: "<p>Hello</p>",
                        text: "Hello",
                    },
                    attributes: {},
                },
                {
                    id: "2",
                    type: "text",
                    text: {
                        html: "<p>World</p>",
                        text: "World",
                    },
                    attributes: {},
                },
            ],
        ];
        const result = extractTextFromNodes(mockNodes);
        assert.deepStrictEqual(result, ["Hello", "World"]);
    });
    it("should ignore non-text nodes", () => {
        const mockNodes = [
            [
                {
                    id: "1",
                    type: "image",
                    image: {
                        alt: "test",
                    },
                    attributes: {},
                },
                {
                    id: "2",
                    type: "text",
                    text: {
                        html: "<p>Hello</p>",
                        text: "Hello",
                    },
                    attributes: {},
                },
            ],
        ];
        const result = extractTextFromNodes(mockNodes);
        assert.deepStrictEqual(result, ["Hello"]);
    });
    it("should handle empty nodes array", () => {
        const mockNodes = [];
        const result = extractTextFromNodes(mockNodes);
        assert.deepStrictEqual(result, []);
    });
    it("should handle nodes without text property", () => {
        const mockNodes = [
            [
                {
                    id: "1",
                    type: "text",
                    attributes: {},
                },
            ],
        ];
        const result = extractTextFromNodes(mockNodes);
        assert.deepStrictEqual(result, []);
    });
});
//# sourceMappingURL=utils.test.js.map