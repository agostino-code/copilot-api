import { copilotBaseUrl, copilotHeaders } from "~/lib/api-config"
import { HTTPError } from "~/lib/error"
import { state } from "~/lib/state"

export const getModels = async () => {
  const response = await fetch(`${copilotBaseUrl(state)}/models`, {
    headers: copilotHeaders(state),
  })

  if (!response.ok) throw new HTTPError("Failed to get models", response)

  const raw = (await response.json()) as ModelsResponse

  // Strict filter: only models verified and genuinely accepted by Copilot completions
  const verifiedChatModels = new Set([
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4.1",
    "gpt-3.5-turbo",
    "gpt-4o-2024-11-20",
    "gpt-4o-2024-08-06",
    "gpt-4o-2024-05-13",
    "gpt-4o-mini-2024-07-18",
    "gpt-4.1-2025-04-14",
    "gpt-4-o-preview",
    "gpt-3.5-turbo-0613",
    "copilot-search-a",
    "copilot-search-b",
    "copilot-search-c",
    "exec-agent-a",
    "exec-agent-b",
    "exec-agent-c",
  ])

  const filtered = raw.data.filter(
    (m) =>
      (m.policy === undefined || m.policy.state !== "disabled") &&
      (verifiedChatModels.has(m.id) || m.capabilities.type === "embeddings"),
  )

  return {
    ...raw,
    data: filtered,
  }
}

export interface ModelsResponse {
  data: Array<Model>
  object: string
}

interface ModelLimits {
  max_context_window_tokens?: number
  max_output_tokens?: number
  max_prompt_tokens?: number
  max_inputs?: number
}

interface ModelSupports {
  tool_calls?: boolean
  parallel_tool_calls?: boolean
  dimensions?: boolean
}

interface ModelCapabilities {
  family: string
  limits: ModelLimits
  object: string
  supports: ModelSupports
  tokenizer: string
  type: string
}

export interface Model {
  capabilities: ModelCapabilities
  id: string
  model_picker_enabled: boolean
  name: string
  object: string
  preview: boolean
  vendor: string
  version: string
  policy?: {
    state: string
    terms: string
  }
}
