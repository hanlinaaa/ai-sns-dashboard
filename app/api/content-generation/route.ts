import { NextResponse } from "next/server"
import {
  generateContentWithOpenAi,
  validateGeneratedContent,
  type GenerateContentInput,
} from "@/services/content-generation"

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as GenerateContentInput
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is not configured. Add it to .env.local before generating content.",
        },
        { status: 500 },
      )
    }

    const contents = await generateContentWithOpenAi(input, {
      apiKey,
      baseUrl: process.env.OPENAI_BASE_URL,
      model: process.env.OPENAI_MODEL,
    })

    return NextResponse.json({
      contents,
      records: validateGeneratedContent(contents, input.brandSettings),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate content.",
      },
      { status: 500 },
    )
  }
}
