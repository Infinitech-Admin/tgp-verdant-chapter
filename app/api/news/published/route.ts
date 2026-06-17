import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    const endpoint = `${API_URL}/news/published${queryString ? `?${queryString}` : ''}`
    
    console.log("=".repeat(50))
    console.log("[News API] 🔍 Fetching from:", endpoint)
    console.log("[News API] 📍 API_URL:", API_URL)
    console.log("=".repeat(50))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: 'no-store',
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const responseText = await response.text()
    console.log("[News API] ✅ Status:", response.status)
    console.log("[News API] 📝 Response length:", responseText.length)
    console.log("[News API] 📝 Preview:", responseText.substring(0, 200))

    if (!response.ok) {
      console.error("[News API] ❌ Full error response:", responseText)
      return NextResponse.json(
        { 
          success: false,
          error: `Laravel API error: ${response.status}`,
          details: responseText,
          endpoint: endpoint // Include for debugging
        }, 
        { status: response.status }
      )
    }

    const data = JSON.parse(responseText)
    console.log("[News API] 🎉 Data structure:", {
      success: data.success,
      hasData: !!data.data,
      isArray: Array.isArray(data.data),
      hasPagination: !!(data.data?.data),
      count: data.data?.data?.length || data.data?.length || 0
    })
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("[News API] 💥 Fatal error:", error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("[News API] Error name:", error.name)
      console.error("[News API] Error message:", error.message)
      console.error("[News API] Error stack:", error.stack)
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.name : typeof error,
        endpoint: process.env.NEXT_PUBLIC_API_URL
      }, 
      { status: 500 }
    )
  }
}
