import dotenv from "dotenv";
import {
  collectionItemsResponse,
  collectionItemsResponseSchema,
  openAIFaqSchema,
  PageDomNodes,
  pagesDomNodesSchema,
  PagesResponse,
  pagesResponseSchema,
  SitesResponse,
  sitesResponseSchema,
} from "./schema.js";
import { openAIApiRequest } from "./openai.js";
import { postBulkItems, findOrCreateCollection } from "./api.js";
import {
  getWebflowPaginationItems,
  WebflowApiRequest,
} from "./webflow-utils.js";
import { extractTextFromNodes } from "./utils.js";
import express from "express";

dotenv.config();

const { WEBFLOW_TOKEN, AUTH_URL } = process.env;
// const webflowToken = WEBFLOW_TOKEN as string;

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get("/auth", (req, res) => {
  res.redirect(AUTH_URL as string);
});

// Endpoint to receive info from the callback URL
app.get("/callback", async (req: any, res: any) => {
  const { code, state } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).send("Authorization code is missing or invalid");
  }

  if (state !== process.env.STATE) {
    return res.status(400).send("State does not match");
  }

  try {
    const tokenResponse = await fetch(
      "https://api.webflow.com/oauth/access_token",
      {
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
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("OAuth error response:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorData,
      });
      throw new Error(
        `OAuth token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`
      );
    }

    const { access_token } = await tokenResponse.json();
    console.log("Successfully obtained access token:", access_token);
    await generateCMS(access_token);
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during OAuth process:", error);
    res
      .status(500)
      .send(
        `OAuth Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
  }
});

app.get("/dashboard", async (req, res) => {
  res.send("Welcome to your dashboard!");
});

const generateCMS = async (accessToken: string) => {
  const siteId = sitesResponseSchema.parse(
    await WebflowApiRequest<SitesResponse>({
      path: `/v2/sites`,
      token: accessToken,
    })
  ).sites[0].id;

  const sitePages = pagesResponseSchema.parse(
    await getWebflowPaginationItems<PagesResponse>({
      path: `/v2/sites/${siteId}/pages`,
      token: accessToken,
      iterableObject: "pages",
    })
  );

  const pagesNodes = pagesDomNodesSchema.parse(
    await Promise.all(
      sitePages.map(({ id: pageId }: { id: string }) =>
        getWebflowPaginationItems<PageDomNodes>({
          path: `/v2/pages/${pageId}/dom`,
          token: accessToken,
          iterableObject: "nodes",
        })
      )
    )
  );

  const collection = await findOrCreateCollection({
    siteId,
    webflowToken: accessToken,
  });

  // If CMS already exists, delete existing items
  if (!collection.isNew) {
    const collectionItems = collectionItemsResponseSchema.parse(
      await getWebflowPaginationItems<collectionItemsResponse>({
        path: `/v2/collections/${collection.id}/items`,
        token: accessToken,
        iterableObject: "items",
      })
    );

    const collectionItemIds = collectionItems.map(({ id }) => {
      return { id };
    });

    await WebflowApiRequest<any>({
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
  const { responses: validatedResponses } = openAIFaqSchema.parse(
    await openAIApiRequest(pagesText)
  );

  // Post AI Faqs to CMS
  postBulkItems(collection.id, validatedResponses, accessToken);
};
