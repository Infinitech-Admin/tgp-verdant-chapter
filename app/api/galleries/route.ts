import { NextResponse } from "next/server"

const API = process.env.NEXT_PUBLIC_API_URL

export async function GET() {
  try {
    const res = await fetch(`${API}/galleries`, {
      credentials: "include",
    })

    const data = await res.json()
    
    // Wrap the response in a success/data structure to match other endpoints
    return NextResponse.json({ 
      success: true, 
      data: data 
    }, { status: res.status })
  } catch {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch galleries" 
    }, { status: 500 })
  }
}
