import { createTransport } from "nodemailer";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1️⃣ Create transporter only once
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2️⃣ Send email function
export const sendMail = asyncHandler(async ({ email, subject, html }) => {
  await transporter.sendMail({
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
});
