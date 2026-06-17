import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000/api"
const API_BASE = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"

// Helper to transform image paths to full URLs
function transformImagePaths(data: any): any {
  if (!data) return data
  
  // Clone the data to avoid mutation
  const transformed = { ...data }
  
  // Transform profile_image if it exists and is a relative path
  if (transformed.profile_image && 
      typeof transformed.profile_image === 'string' && 
      !transformed.profile_image.startsWith('http://') && 
      !transformed.profile_image.startsWith('https://') &&
      !transformed.profile_image.startsWith('data:')) {
    transformed.profile_image = `${API_BASE}${transformed.profile_image.startsWith('/') ? '' : '/'}${transformed.profile_image}`
  }
  
  return transformed
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/member/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
    })

    const contentType = response.headers.get("content-type")
    
    if (!contentType?.includes("application/json")) {
      const text = await response.text()
      console.error("Non-JSON response:", text)
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response from server" 
      }, { status: 500 })
    }

    const data = await response.json()
    
    // Transform image paths in the response
    if (data.data) {
      data.data = transformImagePaths(data.data)
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error fetching member profile:", error)
    return NextResponse.json({ 
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get the FormData from the request
    const formData = await req.formData()

    // Use POST instead of PUT for FormData uploads (Laravel limitation)
    const response = await fetch(`${API_URL}/member/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        // Don't set Content-Type - let fetch set it with boundary for FormData
      },
      credentials: "include",
      body: formData, // Send FormData directly
    })

    const contentType = response.headers.get("content-type")
    
    if (!contentType?.includes("application/json")) {
      const text = await response.text()
      console.error("Non-JSON response:", text)
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response from server",
        debug: text.substring(0, 200)
      }, { status: 500 })
    }

    const data = await response.json()

    if (!response.ok) {
      console.error("Laravel error response:", data)
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update profile",
          errors: data.errors,
        },
        { status: response.status }
      )
    }

    // Transform image paths in the response
    if (data.data) {
      data.data = transformImagePaths(data.data)
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error updating member profile:", error)
    return NextResponse.json({ 
      success: false,
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

    const formData = await req.formData()

    const response = await fetch(`${API_URL}/member/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: formData,
    })

    const contentType = response.headers.get("content-type")
    
    if (!contentType?.includes("application/json")) {
      const text = await response.text()
      console.error("Non-JSON response:", text)
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response from server" 
      }, { status: 500 })
    }

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to create profile",
          errors: data.errors,
        },
        { status: response.status }
      )
    }

    // Transform image paths in the response
    if (data.data) {
      data.data = transformImagePaths(data.data)
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error creating member profile:", error)
    return NextResponse.json({ 
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/member/profile`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
    })

    const contentType = response.headers.get("content-type")
    
    if (!contentType?.includes("application/json")) {
      const text = await response.text()
      console.error("Non-JSON response:", text)
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response from server" 
      }, { status: 500 })
    }

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to delete profile",
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error deleting member profile:", error)
    return NextResponse.json({ 
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
