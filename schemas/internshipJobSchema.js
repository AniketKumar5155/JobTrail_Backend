const z = require("zod");

const createInternshipJobEntrySchema = z.object({
    company_name: z
        .string()
        .min(1, { message: "Company name is required" })
        .max(200, { message: "Company name must not be greater than 200 characters" }),

    role: z
        .string()
        .min(1, { message: "Role is required" })
        .max(200, { message: "Role must not be greater than 200 characters" }),

    category: z
        .enum(["FREELANCING", "INTERNSHIP", "PART-TIME", "FULL-TIME"], {
            message: "Category is required"
        }),

    status: z
        .enum(["APPLIED", "OA-1", "OA-2", "OA-3", "INTERVIEW", "HR", "REJECTED", "GHOSTED"], {
            message: "Status is required"
        }),

    source: z
        .string()
        .max(200, { message: "Source must not be greater 200 characters" })
        .optional(),

    referral: z
        .string()
        .max(200, { message: "Referral must not be greater than 200 characters" }),

    salary_range: z
        .string()
        .max(50, { message: "Salary range must not be greater than 50 characters" }),

    job_url: z
        .string()
        .url({ message: "Invalid URL" })
        .optional()
        .or(z.literal("")),

    applied_date: z
        .coerce
        .date(),

    location: z
        .string()
        .optional(),

    notes: z
        .string()
        .max(2000, { message: "Notes must not be greater 2000 characters" })
        .optional(),
}).strict();

const updateInternshipJobEntrySchema = z.object({
    company_name: z
        .string({ message: "Category is required" })
        .min(1, { message: "Company name must contain atleast 1 character" })
        .max(200, { message: "Company name must not be greater than 200 characters" })
        .optional(),
    role: z
        .string()
        .min(1, { message: "Role must contain atleast 1 character" })
        .max(200, { message: "Role must not be greater than 200 characters" })
        .optional(),

    category: z
        .enum(["FREELANCING", "INTERNSHIP", "PART-TIME", "FULL-TIME"], {
            message: "Category is required"
        })
        .optional(),

    status: z
        .enum(["APPLIED", "OA-1", "OA-2", "OA-3", "INTERVIEW", "HR", "REJECTED", "GHOSTED"], {
            message: "Status is required"
        })
        .optional(),

    source: z
        .string()
        .max(200, { message: "Source must not be greater 200 characters" })
        .optional(),

    job_url: z
        .string()
        .url()
        .optional(),

    applied_date: z
        .coerce
        .date()
        .optional(),

    notes: z
        .string()
        .max(2000, { message: "Notes must not be greater 2000 characters" })
        .optional(),

    rejection_reason: z
        .string()
        .max(2000, { message: "Rejection reason must not be greater than 2000 characters" })
        .optional(),

    is_active: z
        .boolean()
        .optional(),
}).strict();

module.exports = {
    createInternshipJobEntrySchema,
    updateInternshipJobEntrySchema,
}