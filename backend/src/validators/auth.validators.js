import { z } from "zod";

// 🔐 Strong password rules
const strongPassword = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(16, "Password cannot exceed 16 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[@$!%*?&]/, "Password must contain at least one special character");

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name cannot be more than 30 characters"),

  email: z
    .string()
    .email("Invalid email format"),

  password: strongPassword,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(12, "Invalid password").max(16, "Invalid password"),
});
