import OpenAI from "openai";
import dotenv from "dotenv";
import { openAIFaqResponse } from "./schema";
dotenv.config();

const { OPENAI_API_KEY } = process.env;
const apiKey = OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

export const openAIApiRequest = async (
  websiteText: string[]
): Promise<openAIFaqResponse> => {
  const {
    choices: [
      {
        message: { content },
      },
    ],
  } = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "faq",
        schema: {
          type: "object",
          properties: {
            responses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: {
                    type: "string",
                  },
                  answer: {
                    type: "string",
                  },
                },
                required: ["question", "answer"],
              },
            },
          },
          required: ["responses"],
        },
      },
    },
    messages: [
      {
        role: "system",
        content: [
          "As a helpful assistant, your task is to create a frequently asked questions (FAQ) list and provide detailed, accurate answers for each question.",
          "The FAQ should cover common inquiries related to a specific topic or area of interest, and the answers should be informative and helpful to users seeking information.",
          "Your response should include a well-organized list of questions and their corresponding answers, addressing a range of relevant topics or issues.",
          "Each answer should be clear, concise, and provide valuable information that addresses the user's potential queries.",
          "You should aim to anticipate the needs of users and provide comprehensive responses that cover a variety of aspects related to the topic.",
          "Please ensure that the FAQ list and answers are structured in a user-friendly format, making it easy for individuals to find the information they need.",
          "Additionally, the responses should be written in a friendly and approachable tone, creating a positive user experience and fostering trust in the information provided.",
          "Your FAQ list and answers should be flexible and adaptable to different contexts or settings, allowing for a variety of relevant and informative questions and responses.",
          "Please arrange the list of questions in descending order based on their frequency of being asked by customers. Your response should present the questions in a manner that reflects the most commonly asked questions first, followed by the less frequently asked ones. Ensure that the order accurately represents the frequency of customer inquiries and allows for easy identification of the most common questions.",
        ].join("\n"),
      },
      {
        role: "user",
        content: `${websiteText.join("\n")}`,
      },
    ],
  });
  return JSON.parse(content as string); // Question: need to add error management if not string
};
