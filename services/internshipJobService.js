const pool = require('../config/database');

const ALLOWED_UPDATE_FIELDS = [
    "company_name",
    "role",
    "category",
    "status",
    "source",
    "job_url",
    "referral",
    "location",
    "salary_range",
    "applied_date",
    "notes",
    "rejection_reason",
    "is_active",
];

const createInternshipJobEntryService = async (userId, { data }) => {
    const {
        company_name,
        role,
        category,
        status,
        source,
        job_url,
        referral,
        location,
        salary_range,
        applied_date,
        notes,
    } = data;

    const insertResult = await pool.query(
        `
        INSERT INTO applied_internship_jobs
        (
            user_id,
            company_name,
            role,
            category,
            status,
            source,
            job_url,
            referral,
            location,
            salary_range,
            applied_date,
            notes
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING id
        `,
        [
            userId,
            company_name ?? null,
            role ?? null,
            category ?? null,
            status ?? null,
            source ?? null,
            job_url ?? null,
            referral ?? null,
            location ?? null,
            salary_range ?? null,
            applied_date ?? null,
            notes ?? null,
        ]
    );

    const { rows } = await pool.query(
        `
        SELECT
            id,
            user_id,
            company_name,
            role,
            category,
            status,
            source,
            job_url,
            referral,
            location,
            salary_range,
            applied_date,
            notes,
            rejection_reason,
            created_at,
            updated_at
        FROM applied_internship_jobs
        WHERE id = $1
        `,
        [insertResult.rows[0].id]
    );

    return rows[0];
};

const updateInternshipJobEntryService = async (userId, entryId, data) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(data[key] ?? null);
            paramIndex++;
        }
    }

    if (fields.length === 0) {
        throw new Error("No valid fields provided for update");
    }

    values.push(entryId, userId);

    await pool.query(
        `
        UPDATE applied_internship_jobs
        SET ${fields.join(", ")}
        WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
        `,
        values
    );

    const { rows } = await pool.query(
        `
        SELECT
            id,
            user_id,
            company_name,
            role,
            category,
            status,
            source,
            job_url,
            referral,
            location,
            salary_range,
            applied_date,
            notes,
            rejection_reason,
            is_active,
            created_at,
            updated_at
        FROM applied_internship_jobs
        WHERE id = $1 AND user_id = $2
        `,
        [entryId, userId]
    );

    return rows[0];
};

const getAllInternshipJobEntriesService = async ({
    userId,
    filters = {},
    limit = 10,
    page = 1,
    sortType = "created_at",
    sortDirection = "DESC",
}) => {
    const values = [userId];
    const whereClauses = [`user_id = $1`];
    let paramIndex = 2;

    // Filters
    if (filters.category) {
        whereClauses.push(`category = $${paramIndex}`);
        values.push(filters.category);
        paramIndex++;
    }

    if (filters.status) {
        if (filters.status === "NULL") {
            whereClauses.push(`status IS NULL`);
        } else {
            whereClauses.push(`status = $${paramIndex}`);
            values.push(filters.status);
            paramIndex++;
        }
    }

    if (filters.dateFrom) {
        whereClauses.push(`applied_date >= $${paramIndex}`);
        values.push(filters.dateFrom);
        paramIndex++;
    }

    if (filters.dateTo) {
        whereClauses.push(`applied_date <= $${paramIndex}`);
        values.push(filters.dateTo);
        paramIndex++;
    }

    // Text search
    if (filters.search) {
        const searchFields = [
            "company_name",
            "role",
            "rejection_reason",
            "notes",
            "location",
            "source",
            "referral",
            "salary_range",
        ];

        const searchConditions = searchFields.map(
            (field) => `${field} ILIKE $${paramIndex}`
        );

        whereClauses.push(`(${searchConditions.join(" OR ")})`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    // Safe sorting
    const allowedSortColumns = [
        "created_at",
        "updated_at",
        "applied_date",
        "company_name",
    ];

    const sortColumn = allowedSortColumns.includes(sortType)
        ? sortType
        : "created_at";

    const safeSort = sortDirection.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Pagination
    const offset = (page - 1) * limit;

    let sql = `
        SELECT *
        FROM applied_internship_jobs
    `;

    if (whereClauses.length) {
        sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    sql += `
        ORDER BY ${sortColumn} ${safeSort}
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    const result = await pool.query(sql, values);

    let countSQL = `
        SELECT COUNT(*) AS total
        FROM applied_internship_jobs
    `;

    if (whereClauses.length) {
        countSQL += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    const countValues = values.slice(0, paramIndex - 1);
    const countResult = await pool.query(countSQL, countValues);

    return {
        rows: result.rows,
        totalItemsPerPage: limit,
        totalItems: Number(countResult.rows[0].total),
        currentPage: page,
        totalPages: Math.ceil(countResult.rows[0].total / limit),
    };
};

// const getApplicationAnalyticsService = async (userId) => {
    // const totalCountSql = 
        // `
        // SELECT 
        // COUNT(*) as total 
        // FROM applied_internship_jobs 
        // WHERE user_id = $1
        // `;
        // 
    // const categoryWiseCountSql = 
        // `
        // SELECT 
        // COUNT(*) as category 
        // FROM applied_internship_jobs 
        // WHERE user_id = $1
        // GROUP BY category
        // `;
    // const statusWiseCountSql = 
        // `
        // SELECT 
        // COALESCE(null, 'unknown') as status.
        // COUNT(*) as statys
        // FROM applied_internship_jobs 
        // WHERE user_id = $1
        // GROUP BY status
        // `;
// 
        // const totalCount = await pool.query(totalCountSql, [userId])
        // const categoryWiseCountCount = await pool.query(categoryWiseCountSql, [userId])
        // const statusWiseCount = await pool.query(statusWiseCountSql, [userId])
// }

const getApplicationByIdService = async (id) => {
    const { rows } = await pool.query(`
        SELECT
        id,
        user_id,
        company_name,
        role,
        category,
        status,
        source,
        job_url,
        referral,
        location,
        salary_range,
        applied_date,
        notes,
        is_active,
        rejection_reason,
        created_at,
        updated_at
        FROM applied_internship_jobs
        WHERE id = $1
        `,
        [id]
    );

    if(rows.length === 0){
        throw new Error("Application does not exist")
    }

    return rows[0];

}
module.exports = {
    createInternshipJobEntryService,
    updateInternshipJobEntryService,
    getAllInternshipJobEntriesService,
    // getApplicationAnalyticsService
    getApplicationByIdService,
};
