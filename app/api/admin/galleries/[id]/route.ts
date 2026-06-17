import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API = process.env.NEXT_PUBLIC_API_URL!

type Context = {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Context) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  
  // Add _method for Laravel to recognize this as PUT
  formData.append("_method", "PUT")
  
  // Log what we're updating for debugging
  console.log('[Gallery Update] Updating gallery:', {
    id,
    title: formData.get('title'),
    type: formData.get('type'),
    description: formData.get('description'),
    hasImage: !!formData.get('image'),
    _method: formData.get('_method')
  })

  try {
    // ✅ CORRECT: Use parentheses, not backticks!
    const res = await fetch(`${API}/admin/galleries/${id}`, {
      method: "POST", // Use POST with _method=PUT for FormData
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const contentType = res.headers.get("content-type") || ""
    let data

    if (contentType.includes("application/json")) {
      data = await res.json()
      console.log('[Gallery Update] Response:', data)
    } else {
      const text = await res.text()
      console.error("[Gallery Update] Non-JSON response from Laravel:", text)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from server",
          details: text,
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[Gallery Update] Error:', err)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update gallery",
        error: err instanceof Error ? err.message : String(err)
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    // ✅ CORRECT: Use parentheses, not backticks!
    const res = await fetch(`${API}/admin/galleries/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const contentType = res.headers.get("content-type") || ""
    let data

    if (contentType.includes("application/json")) {
      data = await res.json()
      console.log('[Gallery Delete] Response:', data)
    } else {
      const text = await res.text()
      console.error("[Gallery Delete] Non-JSON response from Laravel:", text)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from server",
          details: text,
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[Gallery Delete] Error:', err)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete gallery",
        error: err instanceof Error ? err.message : String(err)
      }, 
      { status: 500 }
    )
  }
}
