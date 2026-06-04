import { NextResponse } from "next/server"
import {
  generateContentWithOpenAi,
  generateMockContent,
  validateGeneratedContent,
  type GenerateContentInput,
} from "@/services/content-generation"

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as GenerateContentInput
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      const contents = generateMockContent(input)

      return NextResponse.json({
        contents,
        records: validateGeneratedContent(contents, input.brandSettings),
        provider: "mock",
      })
    }

    const contents = await generateContentWithOpenAi(input, {
      apiKey,
      baseUrl: process.env.OPENAI_BASE_URL,
      model: process.env.OPENAI_MODEL,
    })

    return NextResponse.json({
      contents,
      records: validateGeneratedContent(contents, input.brandSettings),
      provider: "openai",
    })
  } catch (error) {
    console.error("Content generation route failed:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate content.",
      },
      { status: 500 },
    )
  }
}
