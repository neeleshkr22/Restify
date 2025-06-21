import { type NextRequest, NextResponse } from "next/server"
import { DI } from "@/lib/db"
import { RequestHistory } from "@/lib/entities/RequestHistory"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    const em = DI.em.fork()

    // Get total count for pagination
    const totalCount = await em.count(RequestHistory)
    const totalPages = Math.ceil(totalCount / limit)

    // Get paginated results
    const requests = await em.find(
      RequestHistory,
      {},
      {
        orderBy: { createdAt: "DESC" },
        limit,
        offset,
      },
    )

    return NextResponse.json({
      requests: requests.map((req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        response: req.response,
        statusCode: req.statusCode,
        responseTime: req.responseTime,
        createdAt: req.createdAt.toISOString(),
      })),
      totalPages,
      currentPage: page,
      totalCount,
    })
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const em = DI.em.fork()
    const requestHistory = await em.findOne(RequestHistory, { id: Number.parseInt(id) })

    if (!requestHistory) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    await em.removeAndFlush(requestHistory)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
  }
}
