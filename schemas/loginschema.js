const z = require("zod");

const loginSchema = z.object({
    identifier: z
        .string()
        .min(3, { error: "Username/Email must atleast be 3 characters" }),

    password: z
        .string({ error: "Password is required" })
        .min(8, { error: "Password must be at least 8 characters long" }),
});

module.exports = loginSchema;