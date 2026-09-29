import { Hono } from "hono"
import { createChatCompletions } from "~/services/copilot/create-chat-completions"

export const responsesRoute = new Hono()

responsesRoute.post("/", async (c) => {
  const body = await c.req.json()

  // Translate OpenAI /responses payload to chat completions format if needed
  let messages = body.messages
  if (!messages && body.input) {
    if (typeof body.input === "string") {
      messages = [{ role: "user", content: body.input }]
    } else if (Array.isArray(body.input)) {
      messages = body.input.map((item: unknown) => {
        if (typeof item === "string") return { role: "user", content: item }
        return item
      })
    }
  }

  const payload = {
    model: body.model || "gpt-4o",
    messages: messages || [{ role: "user", content: "Hello" }],
    stream: body.stream || false,
    temperature: body.temperature,
    max_tokens: body.max_output_tokens || body.max_tokens,
  }

  const result = await createChatCompletions(payload)
  return c.json(result)
})
