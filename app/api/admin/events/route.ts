import { type NextRequest, NextResponse } from "next/server"
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

    const response = await fetch(`${API_URL}/admin/events?${queryParams}`, {
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
    console.error("Error fetching events:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const response = await fetch(`${API_URL}/admin/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: JSON.stringify(body),
    })

    const text = await response.text()
    let data

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
          message: data.message || "Failed to create event",
          errors: data.errors,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}