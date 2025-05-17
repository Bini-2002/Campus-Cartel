import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Add system message to guide the AI assistant
  const systemMessage = {
    role: "system",
    content: `You are the CampusCraft assistant, a helpful AI that provides information about the CampusCraft platform.
    
    CampusCraft is a platform that connects university students with tech companies. Students can showcase their projects, 
    build profiles, and apply for internships and jobs. Tech companies can post opportunities and discover talented students.
    
    Be friendly, concise, and helpful. If you don't know something specific about the platform, provide general guidance 
    based on the platform's purpose.`,
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages: [systemMessage, ...messages],
  })

  return result.toDataStreamResponse()
}
