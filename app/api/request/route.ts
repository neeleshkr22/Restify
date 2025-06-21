import { type NextRequest, NextResponse } from "next/server"
import { DI } from "@/lib/db"
import { RequestHistory } from "@/lib/entities/RequestHistory"

export async function POST(request: NextRequest) {
  try {
    const { method, url, headers, body } = await request.json()

    if (!method || !url) {
      return NextResponse.json({ error: "Method and URL are required" }, { status: 400 })
    }

    const startTime = Date.now()

    // Make the actual HTTP request
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...headers,
        "User-Agent": "REST-Client/1.0",
      },
    }

    if (body && method !== "GET" && method !== "HEAD") {
      requestOptions.body = typeof body === "string" ? body : JSON.stringify(body)
    }

    let response: Response
    let responseData: any
    let statusCode: number

    try {
      response = await fetch(url, requestOptions)
      statusCode = response.status

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch (fetchError) {
      statusCode = 0
      responseData = {
        error: "Network error or invalid URL",
        message: fetchError instanceof Error ? fetchError.message : "Unknown error",
      }
    }

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Save to database
    try {
      const em = DI.em.fork()
      const requestHistory = new RequestHistory()
      requestHistory.method = method
      requestHistory.url = url
      requestHistory.headers = JSON.stringify(headers || {})
      requestHistory.body = body || ""
      requestHistory.response = JSON.stringify(responseData)
      requestHistory.statusCode = statusCode
      requestHistory.responseTime = responseTime
      requestHistory.createdAt = new Date()

      await em.persistAndFlush(requestHistory)
    } catch (dbError) {
      console.error("Failed to save request history:", dbError)
      // Continue even if DB save fails
    }

    // Return response headers as an object
    const responseHeaders: Record<string, string> = {}
    if (response) {
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
    }

    return NextResponse.json({
      data: responseData,
      status: statusCode,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
