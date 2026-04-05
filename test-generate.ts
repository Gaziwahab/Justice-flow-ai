import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fetch from "node-fetch";

// Setup polyfills for Node if needed
if (!global.fetch) {
  global.fetch = fetch as any;
}

const model = google("gemini-2.0-flash");

async function test() {
  try {
    const { text } = await generateText({
      model,
      prompt: "Tell me a joke",
    });
    console.log("Success:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
