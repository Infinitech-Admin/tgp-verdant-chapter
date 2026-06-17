import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// PUT - Update business partner (Admin)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required - no auth token found" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    
    // CRITICAL: Add _method field for Laravel method spoofing
    // Laravel cannot handle file uploads with PUT directly
    formData.append('_method', 'PUT')

    console.log("=== UPDATE REQUEST ===")
    console.log("URL:", `${API_URL}/admin/business-partners/${id}`)
    console.log("FormData contents:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}]` : value)
    }

    // Use POST with _method=PUT for Laravel compatibility
    const response = await fetch(`${API_URL}/admin/business-partners/${id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken.value}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
    })

    console.log("Laravel response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    // FIXED: Check content type and handle empty responses
    const contentType = response.headers.get("content-type")
    let data

    // Check if response has content
    const responseText = await response.text()
    console.log("Raw response:", responseText)

    if (!responseText || responseText.trim() === '') {
      console.error("Empty response from Laravel")
      return NextResponse.json(
        { 
          success: false, 
          message: "Server returned empty response. Check Laravel logs.",
          status: response.status
        },
        { status: 500 }
      )
    }

    // Try to parse JSON
    if (contentType?.includes("application/json")) {
      try {
        data = JSON.parse(responseText)
        console.log("Laravel response data:", data)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        console.error("Response text:", responseText.substring(0, 500))
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid JSON response from server",
            debug: responseText.substring(0, 500)
          },
          { status: 500 }
        )
      }
    } else {
      console.error("Non-JSON response from Laravel:", responseText.substring(0, 500))
      return NextResponse.json(
        { 
          success: false, 
          message: "Server returned non-JSON response",
          debug: responseText.substring(0, 500)
        },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update business",
          errors: data.errors,
          error: data.error,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error updating business:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete business partner (Admin)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required - no auth token found" },
        { status: 401 }
      )
    }

    console.log("=== DELETE REQUEST ===")
    console.log("URL:", `${API_URL}/admin/business-partners/${id}`)

    const response = await fetch(`${API_URL}/admin/business-partners/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken.value}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    console.log("Laravel response status:", response.status)

    // FIXED: Handle empty responses
    const responseText = await response.text()
    console.log("Raw response:", responseText)

    if (!responseText || responseText.trim() === '') {
      console.error("Empty response from Laravel")
      return NextResponse.json(
        { 
          success: false, 
          message: "Server returned empty response. Check Laravel logs.",
          status: response.status
        },
        { status: 500 }
      )
    }

    const contentType = response.headers.get("content-type")
    let data
    
    if (contentType?.includes("application/json")) {
      try {
        data = JSON.parse(responseText)
        console.log("Laravel response data:", data)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid JSON response from server",
            debug: responseText.substring(0, 500)
          },
          { status: 500 }
        )
      }
    } else {
      console.error("Non-JSON response from Laravel:", responseText.substring(0, 500))
      return NextResponse.json(
        { 
          success: false, 
          message: "Server returned non-JSON response",
          debug: responseText.substring(0, 500)
        },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to delete business",
          errors: data.errors,
          error: data.error,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error deleting business:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
