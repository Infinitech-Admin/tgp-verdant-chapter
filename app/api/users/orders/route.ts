// app/api/users/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        console.log('Fetching orders from:', `${API_URL}/users/orders`)

        const response = await fetch(`${API_URL}/users/orders`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            cache: "no-store",
        })

        console.log('Response status:', response.status)

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text()
            console.error('Non-JSON response:', text.substring(0, 500))
            return NextResponse.json(
                {
                    success: false,
                    message: "Backend server error",
                },
                { status: 500 }
            )
        }

        const data = await response.json()
        
        return NextResponse.json(data, { status: response.status })
    } catch (error: any) {
        console.error("Error fetching orders:", error)
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch orders",
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        console.log('Creating order at:', `${API_URL}/users/orders`)

        // Get the FormData from the request
        const formData = await request.formData()

        // Log what we're sending (for debugging)
        console.log('Form data keys:', Array.from(formData.keys()))
        
        // Get payment method to check if it's COD
        const paymentMethod = formData.get('payment_method')
        console.log('Payment method:', paymentMethod)

        // Create new FormData for backend
        const backendFormData = new FormData()
        
        // Always include these fields
        backendFormData.append('payment_method', formData.get('payment_method') as string)
        backendFormData.append('total_amount', formData.get('total_amount') as string)
        backendFormData.append('items', formData.get('items') as string)
        
        // Optional notes
        const notes = formData.get('notes')
        if (notes) {
            backendFormData.append('notes', notes as string)
        }
        
        // Only include proof_of_payment if it exists (not required for COD)
        const proofOfPayment = formData.get('proof_of_payment')
        if (proofOfPayment && proofOfPayment instanceof File && proofOfPayment.size > 0) {
            backendFormData.append('proof_of_payment', proofOfPayment)
            console.log('Including proof of payment:', proofOfPayment.name, proofOfPayment.size, 'bytes')
        } else {
            console.log('No proof of payment included (COD or not provided)')
        }

        // Forward the FormData to Laravel backend
        const response = await fetch(`${API_URL}/users/orders`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Don't set Content-Type - let the browser set it with boundary for multipart/form-data
            },
            body: backendFormData,
        })

        console.log('Response status:', response.status)

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text()
            console.error('Non-JSON response:', text.substring(0, 500))
            return NextResponse.json(
                {
                    success: false,
                    message: "Backend server error - Invalid response format",
                },
                { status: 500 }
            )
        }

        const data = await response.json()
        
        // Log the response for debugging
        if (!response.ok) {
            console.error('Backend error response:', data)
        }
        
        // Return the data with the same status code from Laravel
        return NextResponse.json(data, { status: response.status })
    } catch (error: any) {
        console.error("Error creating order:", error)
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to create order",
            },
            { status: 500 }
        )
    }
}