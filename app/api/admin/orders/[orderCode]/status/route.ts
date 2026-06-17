// app/api/admin/orders/[orderCode]/status/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ orderCode: string }> }
) {
    try {
        const paramsObj = await params
        const orderCode = paramsObj.orderCode

        // Parse the request body to get the status
        const body = await request.json()
        const newStatus = body.status

        console.log(`[Order Status Update] Updating order ${orderCode} to status ${newStatus}`)

        if (!newStatus) {
            return NextResponse.json(
                { success: false, message: "Status is required" },
                { status: 400 }
            )
        }

        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            console.log(`[Order Status Update] No auth token found`)
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        // Make request to Laravel backend
        // The Laravel endpoint expects the order code as a parameter
        const backendUrl = `${API_URL}/admin/orders/${orderCode}/status`
        console.log(`[Order Status Update] Calling backend: ${backendUrl}`)

        const res = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify({ status: newStatus }),
        })

        console.log(`[Order Status Update] Backend response status: ${res.status}`)

        if (!res.ok) {
            const errorText = await res.text()
            console.error(`[Order Status Update] Backend error: ${errorText}`)
            
            let errorData
            try {
                errorData = JSON.parse(errorText)
            } catch {
                errorData = { message: errorText || `HTTP ${res.status}` }
            }

            return NextResponse.json(
                {
                    success: false,
                    message: errorData.message || `Failed to update order status: ${res.status}`,
                },
                { status: res.status }
            )
        }

        const data = await res.json()
        console.log(`[Order Status Update] Success:`, data)

        return NextResponse.json({
            success: true,
            message: `Order ${orderCode} updated to ${newStatus}`,
            data: data,
        })
    } catch (err: any) {
        console.error("[POST /api/admin/orders/:orderCode/status] Error:", err)
        return NextResponse.json(
            { success: false, message: err.message || "Internal server error" },
            { status: 500 }
        )
    }
}
