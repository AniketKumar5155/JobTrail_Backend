const { z } = require("zod");

const signupSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(3, { error: "Name must be at least 3 characters" })
    .max(100, { error: "Name must be at most 100 characters" }),

  username: z
    .string({ error: "Username is required" })
    .min(3, { error: "Username must be at least 3 characters" })
    .max(50, { error: "Username must be at most 50 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      error: "Username can contain only letters, numbers, and underscores",
    }),

  email: z.email({ error: "Invalid email address" }),

  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, { error: "Invalid phone number" })
    .optional(),

  password: z
    .string({ error: "Password is required" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    })
    .min(8, { error: "Password must be at least 8 characters long" }),

  otp: z
    .string({ error: "OTP is required" })
    .length(6, { error: "OTP must be 6 digits" })
    .regex(/^[0-9]{6}$/, { error: "OTP must contain only digits" }),

  profile_picture_url: z.url().optional(),
  linkedin_url: z.url().optional(),
  github_url: z.url().optional(),
  resume_url: z.url().optional(),
});

module.exports = signupSchema;
