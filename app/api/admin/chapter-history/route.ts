import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000/api"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const queryParams = url.searchParams.toString()

    const res = await fetch(`${API_URL}/admin/chapter-history?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
    })

    const text = await res.text()
    let data

    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse JSON response")
      console.error("Response status:", res.status)
      console.error("Response body:", text.substring(0, 500))
      
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response from server",
        debug: text.substring(0, 200)
      }, { status: 500 })
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("Admin chapter history GET error:", err)
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error",
        error: err instanceof Error ? err.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" }, 
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await fetch(`${API_URL}/admin/chapter-history`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken.value}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: JSON.stringify(body),
    })

    const text = await response.text()
    let data

    // Try to parse as JSON
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse JSON response from Laravel")
      console.error("Response status:", response.status)
      console.error("Response body:", text.substring(0, 500))
      
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid response from server. Check server logs.",
          debug: {
            status: response.status,
            bodyPreview: text.substring(0, 200)
          }
        }, 
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to create chapter history",
          errors: data.errors,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating chapter history:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}