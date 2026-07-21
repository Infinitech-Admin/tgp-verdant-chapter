import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface EmailData {
  to: string;
  name: string;
  membershipId: string;
  email: string;
  phoneNumber?: string;
  fraternityNumber?: string;
  address?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailData = await request.json();
    const {
      to,
      name,
      membershipId,
      email,
      phoneNumber,
      fraternityNumber,
      address,
    } = body;

    // Validate required fields
    if (!to || !name || !membershipId || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email HTML template
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #dc2626;
            margin-top: 0;
            font-size: 24px;
        }
        .info-box {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
        }
        .info-box h3 {
            margin: 0 0 15px;
            color: #dc2626;
            font-size: 18px;
        }
        .credential-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #fee2e2;
        }
        .credential-item:last-child {
            border-bottom: none;
        }
        .credential-label {
            font-weight: 600;
            color: #7f1d1d;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            color: #991b1b;
            font-weight: bold;
        }
        .btn {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .note {
            background-color: #fff7ed;
            border-left: 4px solid #ea580c;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .note p {
            margin: 0;
            color: #7c2d12;
            font-size: 14px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 13px;
        }
        ul {
            background-color: #f9fafb;
            padding: 20px 20px 20px 40px;
            border-radius: 5px;
        }
        ol {
            background-color: #f9fafb;
            padding: 20px 20px 20px 40px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 Account Approved!</h1>
          <p>Welcome to the Tau Gamma Phi Fraternity - Verdant Las Piñas Chapter</p>
        </div>

        <!-- Content -->
        <div class="content">
            <h2>Hello, ${name}!</h2>
            
            <p>Great news! Your account has been successfully approved by our administration team. You can now access the Fraternity Management System.</p>

            <!-- Login Credentials Box -->
            <div class="info-box">
                <h3>📋 Your Login Credentials</h3>
                <div class="credential-item">
                    <span class="credential-label">Username (Membership ID):</span>
                    <span class="credential-value">${membershipId}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${email}</span>
                </div>
            </div>

            <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" class="btn">
                    🔐 Login to Your Account
                </a>
            </p>

            <!-- Important Note -->
            <div class="note">
                <p><strong>📌 Important:</strong> Please use your <strong>Membership ID (${membershipId})</strong> as your username to log in. If you haven't set a password yet, please use the "Forgot Password" option on the login page.</p>
            </div>

            <!-- Account Details -->
            <h3 style="color: #dc2626; margin-top: 30px;">📝 Your Account Information</h3>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                ${phoneNumber ? `<li><strong>Phone:</strong> ${phoneNumber}</li>` : ""}
                ${fraternityNumber ? `<li><strong>Fraternity Number:</strong> ${fraternityNumber}</li>` : ""}
                ${address ? `<li><strong>Address:</strong> ${address}</li>` : ""}
                <li><strong>Membership ID:</strong> ${membershipId}</li>
                <li><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Approved ✓</span></li>
            </ul>

            <!-- Next Steps -->
            <h3 style="color: #dc2626; margin-top: 30px;">🚀 Next Steps</h3>
            <ol>
                <li>Click the "Login to Your Account" button above</li>
                <li>Enter your Membership ID: <strong>${membershipId}</strong></li>
                <li>Use your registered email or set up your password</li>
                <li>Start exploring the fraternity system features</li>
            </ol>

            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

            <p style="margin-top: 20px;">Welcome aboard!</p>
            
            <p style="margin-top: 5px; font-weight: bold; color: #dc2626;">The Fraternity Administration Team</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Tau Gamma Phi Fraternity - Verdant Las Piñas Chapter</strong></p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p style="margin-top: 15px; font-size: 12px;">© ${new Date().getFullYear()} Tau Gamma Phi Fraternity - Verdant Las Piñas Chapter<. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Tau Gamma Phi Fraternity - Verdant Las Piñas Chapter" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: to,
      subject: "🎉 Account Approved",
      html: htmlTemplate,
    });

    console.log("Email sent successfully:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Approval email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 },
    );
  }
}
