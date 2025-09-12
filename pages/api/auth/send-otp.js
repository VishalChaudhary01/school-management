import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  const html = `
  <body style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
    <table width="100%" style="max-width:600px; margin:auto; background:#fff; border-radius:10px; padding:30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <tr>
        <td style="text-align:center;">
          <h1 style="color:#333; margin-bottom:30px;">School Management Platform</h1>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;">
          <h2 style="color:#444; margin-bottom:20px;">Your Verification Code</h2>
          <div style="background:#f8f9fa; border:2px dashed #3b82f6; border-radius:10px; padding:20px; margin:20px 0;">
            <span style="font-size:32px; font-weight:bold; color:#3b82f6; letter-spacing:5px;">${otp}</span>
          </div>
          <p style="color:#666; font-size:14px; margin:20px 0;">
            This code will expire in 10 minutes for security reasons.
          </p>
          <p style="color:#666; font-size:12px;">
            If you didn't request this code, please ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
  `;

  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Your Login Verification Code',
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: 'Email is required' });
  }

  try {
    await prisma.$connect();

    let user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { email, emailVerified: null },
      });
    }

    const otpExist = await prisma.verificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (otpExist && otpExist.createdAt > new Date(Date.now() - 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many OTP requests. Please wait before requesting again.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up old OTPs for this email
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Save OTP to database
    const newCode = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: otp,
        expires,
      },
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to send OTP email' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
