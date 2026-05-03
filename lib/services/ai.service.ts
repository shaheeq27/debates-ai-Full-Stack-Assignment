import { IIntegration } from "@/lib/db/models/ProductInstance";
import { SHOPIFY_MOCK_DATA, CRM_MOCK_DATA } from "@/lib/services/mock-data";

interface AICallOptions {
  userMessage: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  integrations: IIntegration[];
  projectName: string;
}

interface AIResult {
  content: string;
  steps: string[];
}

function buildSystemPrompt(
  integrations: IIntegration[],
  projectName: string
): string {
  const enabledIntegrations = integrations.filter((i) => i.enabled);

  let systemPrompt = `You are an intelligent AI Sales Assistant for ${projectName}. 
You help with product recommendations, order tracking, customer inquiries, and sales support.
Be concise, helpful, and professional. Keep responses under 200 words unless asked for detail.`;

  if (enabledIntegrations.length > 0) {
    systemPrompt += `\n\nYou have access to the following live data:`;

    if (enabledIntegrations.find((i) => i.type === "shopify")) {
      systemPrompt += `\n\nSHOPIFY STORE DATA:
${JSON.stringify(SHOPIFY_MOCK_DATA, null, 2)}
Use this data to answer product, inventory, and order questions.`;
    }

    if (enabledIntegrations.find((i) => i.type === "crm")) {
      systemPrompt += `\n\nCRM DATA:
${JSON.stringify(CRM_MOCK_DATA, null, 2)}
Use this data to answer customer and relationship questions.`;
    }
  }

  return systemPrompt;
}

function buildSteps(integrations: IIntegration[]): string[] {
  const steps: string[] = [];
  const enabled = integrations.filter((i) => i.enabled);

  steps.push("Analyzing your message...");

  if (enabled.find((i) => i.type === "shopify")) {
    steps.push("Fetching Shopify inventory & order data...");
  }
  if (enabled.find((i) => i.type === "crm")) {
    steps.push("Querying CRM customer records...");
  }

  steps.push("Generating response...");
  return steps;
}

export async function generateAIResponse(
  options: AICallOptions
): Promise<AIResult> {
  const { userMessage, conversationHistory, integrations, projectName } =
    options;

  const steps = buildSteps(integrations);
  const systemPrompt = buildSystemPrompt(integrations, projectName);

  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await callGemini(
        userMessage,
        conversationHistory,
        systemPrompt
      );
      return { content: result, steps };
    } catch (err) {
      console.error("Gemini error, trying fallback:", err);
    }
  }

  // Try OpenRouter fallback
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const result = await callOpenRouter(
        userMessage,
        conversationHistory,
        systemPrompt
      );
      return { content: result, steps };
    } catch (err) {
      console.error("OpenRouter error:", err);
    }
  }

  // Final fallback — smart mock response
  return {
    content: generateMockResponse(userMessage, integrations, projectName),
    steps,
  };
}

async function callGemini(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): Promise<string> {
  const API_KEY = process.env.GEMINI_API_KEY;
  const MODEL = "gemini-1.5-flash";

  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No content from Gemini");
  return text;
}

async function callOpenRouter(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): Promise<string> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Debales AI Assistant",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: userMessage },
        ],
        max_tokens: 512,
      }),
    }
  );

  if (!response.ok) throw new Error("OpenRouter API error");
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "I couldn't generate a response.";
}

function generateMockResponse(
  message: string,
  integrations: IIntegration[],
  projectName: string
): string {
  const lowerMsg = message.toLowerCase();
  const shopifyEnabled = integrations.find(
    (i) => i.type === "shopify" && i.enabled
  );
  const crmEnabled = integrations.find((i) => i.type === "crm" && i.enabled);

  if (
    (lowerMsg.includes("product") || lowerMsg.includes("inventory")) &&
    shopifyEnabled
  ) {
    return `Based on your Shopify store data, here are our top products:\n\n• **Wireless Pro Headphones** — $149.99 (23 in stock)\n• **Smart Watch Series 5** — $299.99 (8 in stock, low!)\n• **Bluetooth Speaker** — $79.99 (45 in stock)\n\nWould you like more details on any of these?`;
  }

  if (
    (lowerMsg.includes("customer") || lowerMsg.includes("client")) &&
    crmEnabled
  ) {
    return `I can see from your CRM that you have 3 high-value customers this week. Sarah Chen from TechCorp recently placed an order of $2,400. John Martinez from RetailPro has been inactive for 14 days — it might be worth reaching out!`;
  }

  if (lowerMsg.includes("order") && shopifyEnabled) {
    return `Your latest order #1042 from Emily Davis is currently in transit — shipped 2 days ago and expected by Friday. Order #1041 for $89.99 was delivered yesterday. Is there a specific order you'd like to track?`;
  }

  return `Hello! I'm your AI Sales Assistant for **${projectName}**. I can help you with:\n\n• Product recommendations & inventory\n• Order tracking & management\n• Customer insights & CRM data\n• Sales analytics\n\nWhat would you like to know?`;
}
