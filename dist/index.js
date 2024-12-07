import dotenv from "dotenv";
import { collectionItemsResponseSchema, openAIFaqSchema, pagesDomNodesSchema, pagesResponseSchema, sitesResponseSchema, } from "./schema.js";
import { openAIApiRequest } from "./openai.js";
import { postBulkItems, findOrCreateCollection } from "./api.js";
import { getWebflowPaginationItems, WebflowApiRequest, } from "./webflow-utils.js";
import { extractTextFromNodes } from "./utils.js";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// Fix cms items being for staging
// Fix gif
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const { AUTH_URL } = process.env;
const app = express();
const port = parseInt(process.env.PORT || "8080", 10);
// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", join(__dirname, "..", "src", "views"));
// Serve static files from 'public' directory
app.use(express.static(join(__dirname, "..", "public")));
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${port}`);
});
app.get("/auth", (req, res) => {
    res.redirect(AUTH_URL);
});
app.get("/", (req, res) => {
    res.render("landing", { authUrl: AUTH_URL });
});
// Endpoint to receive info from the callback URL
app.get("/callback", async (req, res) => {
    const { code, state } = req.query;
    if (!code || typeof code !== "string") {
        return res.status(400).send("Authorization code is missing or invalid");
    }
    if (state !== process.env.STATE) {
        return res.status(400).send("State does not match");
    }
    try {
        const tokenResponse = await fetch("https://api.webflow.com/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code: code,
                grant_type: "authorization_code",
                redirect_URI: process.env.REDIRECT_URI?.trim(),
            }),
        });
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error("OAuth error response:", {
                status: tokenResponse.status,
                statusText: tokenResponse.statusText,
                body: errorData,
            });
            throw new Error(`OAuth token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }
        const { access_token } = await tokenResponse.json();
        res.redirect(`/loading?access_token=${access_token}`);
    }
    catch (error) {
        console.error("Error during OAuth process:", error);
        res
            .status(500)
            .send(`OAuth Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
});
app.get("/loading", async (req, res) => {
    const { access_token } = req.query;
    res.render("loading", { access_token });
});
app.get("/dashboard", async (req, res) => {
    const { access_token } = req.query;
    console.log("access_token", access_token);
    const { faqs, siteDisplayName } = await generateCMS(access_token);
    // Redirect to dashboard after processing
    // res.redirect(
    //   `/dashboard?faqs=${encodeURIComponent(
    //     JSON.stringify(faqs)
    //   )}&siteDisplayName=${encodeURIComponent(JSON.stringify(siteDisplayName))}`
    // );
    // const faqs = req.query.faqs
    //   ? JSON.parse(decodeURIComponent(req.query.faqs as string))
    //   : [];
    // const siteDisplayName = req.query.siteDisplayName
    //   ? JSON.parse(decodeURIComponent(req.query.siteDisplayName as string))
    //   : [];
    res.render("dashboard", { faqs, siteDisplayName }); // Pass faqs as an object
});
const generateCMS = async (accessToken) => {
    const site = sitesResponseSchema.parse(await WebflowApiRequest({
        path: `/v2/sites`,
        token: accessToken,
    })).sites[0];
    const siteId = site.id;
    const siteDisplayName = site.displayName;
    const sitePages = pagesResponseSchema.parse(await getWebflowPaginationItems({
        path: `/v2/sites/${siteId}/pages`,
        token: accessToken,
        iterableObject: "pages",
    }));
    const pagesNodes = pagesDomNodesSchema.parse(await Promise.all(sitePages.map(({ id: pageId }) => getWebflowPaginationItems({
        path: `/v2/pages/${pageId}/dom`,
        token: accessToken,
        iterableObject: "nodes",
    }))));
    const collection = await findOrCreateCollection({
        siteId,
        webflowToken: accessToken,
    });
    // If CMS already exists, delete existing items
    if (!collection.isNew) {
        const collectionItems = collectionItemsResponseSchema.parse(await getWebflowPaginationItems({
            path: `/v2/collections/${collection.id}/items`,
            token: accessToken,
            iterableObject: "items",
        }));
        const collectionItemIds = collectionItems.map(({ id }) => {
            return { id };
        });
        await WebflowApiRequest({
            path: `/v2/collections/${collection.id}/items`,
            token: accessToken,
            method: "DELETE",
            body: {
                items: collectionItemIds,
            },
        });
    }
    // Generate OpenAI faqs
    const pagesText = extractTextFromNodes(pagesNodes);
    // Call OpenAI
    const { responses: validatedResponses } = openAIFaqSchema.parse(await openAIApiRequest(pagesText));
    // Post AI Faqs to CMS
    await postBulkItems(collection.id, validatedResponses, accessToken);
    return { faqs: validatedResponses, siteDisplayName };
};
//# sourceMappingURL=index.js.map