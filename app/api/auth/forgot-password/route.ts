import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mailer";

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const GENERIC_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: { email: ["The email field is required."] },
        },
        { status: 422 },
      );
    }

    const response = await fetch(
      `${LARAVEL_API_URL}/auth/generate-reset-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: body.email }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 422) {
        return NextResponse.json(data, { status: 422 });
      }
      console.error("generate-reset-token failed:", data);
      return NextResponse.json(
        { success: false, message: "Something went wrong" },
        { status: 500 },
      );
    }

    if (data.token) {
      try {
        await sendPasswordResetEmail(data.email, data.token);
      } catch (mailError) {
        console.error("Failed to send reset email:", mailError);
      }
    }

    return NextResponse.json(
      { success: true, message: GENERIC_MESSAGE },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to connect to the server" },
      { status: 500 },
    );
  }
}
