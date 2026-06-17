import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000/api"

// GET - Fetch all lost/stolen reports (Admin)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()

    const response = await fetch(`${API_URL}/admin/lost-stolen?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
    })

    const text = await response.text()
    let data

    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse JSON response")
      console.error("Response status:", response.status)
      console.error("Response body:", text.substring(0, 500))
      
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response from server",
        debug: text.substring(0, 200)
      }, { status: 500 })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Admin lost/stolen GET error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}