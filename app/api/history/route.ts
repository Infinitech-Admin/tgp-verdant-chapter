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

    // Fetch from Laravel backend - using member endpoint
    const res = await fetch(`${API_URL}/chapter-history`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
    })

    if (!res.ok) {
      console.error(`Laravel API returned ${res.status}`)
      return NextResponse.json(
        { 
          success: false, 
          message: `Failed to fetch chapter history: ${res.status}` 
        }, 
        { status: res.status }
      )
    }

    const text = await res.text()
    let data

    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse JSON response")
      console.error("Response body:", text.substring(0, 500))
      
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response from server"
      }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("Chapter history API error:", err)
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