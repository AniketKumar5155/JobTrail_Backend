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

    const newEntryResult = await pool.query(
        `INSERT INTO applied_internship_jobs
         (user_id, company_name, role, category, status, source, job_url, referral, location, salary_range, applied_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [userId, company_name, role, category, status, source, job_url, referral, location, salary_range, applied_date || null, notes]
    );

    const rowResult = await pool.query(
        `SELECT id, user_id, company_name, role, category, status, source, job_url, referral, location, salary_range, applied_date, notes
         FROM applied_internship_jobs WHERE id = $1`,
        [newEntryResult.rows[0].id]
    );

    const newEntryData = rowResult.rows[0];

    return newEntryData
}

const updateInternshipJobEntryService = async (userId, entryId, data) => {
    const fields = [];
    const values = [];

    let paramIndex = 1;
    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(data[key]);
            paramIndex++;
        }
    }

    if (fields.length === 0) {
        throw new Error("No valid fields provided for update")
    }

    values.push(entryId, userId);
    const idIndex = paramIndex;
    const userIdIndex = paramIndex + 1;

    await pool.query(
        `UPDATE applied_internship_jobs
        SET ${fields.join(",")}
        WHERE id = $${idIndex} AND user_id = $${userIdIndex}`,
        values
    );

    const rowResult = await pool.query(
        `SELECT id, user_id, company_name, role, category, status, source, job_url, referral, location, salary_range, applied_date, notes, rejection_reason, is_active
        FROM applied_internship_jobs
        WHERE id = $1 AND user_id = $2`,
        [entryId, userId]
    );

    const updatedEntry = rowResult.rows[0];

    return updatedEntry
    
}

const getAllInternshipJobEntriesService = async ({
    userId,
    filters = {},
    limit = 10,
    page = 1,
    sortType = "created_at",
    sortDirection = "DESC"
}) => {
    const values = [userId];
    const buildClause = [`user_id = $1`];
    let paramIndex = 2;

    // Filters
    if (filters.category) {
        buildClause.push(`category = $${paramIndex}`);
        values.push(filters.category);
        paramIndex++;
    }

    if (filters.status) {
        if (filters.status === "NULL") {
            buildClause.push(`status IS NULL`);
        } else {
            buildClause.push(`status = $${paramIndex}`);
            values.push(filters.status);
            paramIndex++;
        }
    }

    if (filters.dateFrom) {
        buildClause.push(`applied_date >= $${paramIndex}`);
        values.push(filters.dateFrom);
        paramIndex++;
    }

    if (filters.dateTo) {
        buildClause.push(`applied_date <= $${paramIndex}`);
        values.push(filters.dateTo);
        paramIndex++;
    }

    // Text search
    if (filters.search) {
        const searchFields = [
            "company_name", "role", "rejection_reason", "notes", "location", "source", "referral", "salary_range"
        ];
        const searchConditions = searchFields.map((field, idx) => `${field} LIKE $${paramIndex + idx}`);
        buildClause.push(`(${searchConditions.join(" OR ")})`);
        const searchValue = `%${filters.search}%`;
        for (let i = 0; i < searchFields.length; i++) {
            values.push(searchValue);
        }
        paramIndex += searchFields.length;
    }

    // Safe sorting
    const allowedSortColumns = ["created_at", "updated_at", "applied_date", "company_name"];
    const sortColumn = allowedSortColumns.includes(sortType) ? sortType : "created_at";
    const safeSort = sortDirection.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Pagination
    const offset = (page - 1) * limit;

    // Build SQL
    let sql = `SELECT * FROM applied_internship_jobs`;
    if (buildClause.length > 0) sql += " WHERE " + buildClause.join(" AND ");
    sql += ` ORDER BY ${sortColumn} ${safeSort} LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    sql = sql.replace(/\?/g, (_, idx) => `$${idx + 1}`); // Defensive, but should not be needed
    const result = await pool.query(sql, values);

    // Count total for pagination
    let countSQL = `SELECT COUNT(*) AS total FROM applied_internship_jobs`;
    if (buildClause.length > 0) countSQL += " WHERE " + buildClause.join(" AND ");
    const countResult = await pool.query(countSQL, values.slice(0, values.length - 2));

    return {
            rows: result.rows,
            totalItemsPerPage: limit,
            totalItems: countResult.rows[0].total,
            currentPage: page,
            totalPages: Math.ceil(countResult.rows[0].total / limit),
        }
};


module.exports = {
    createInternshipJobEntryService,
    updateInternshipJobEntryService,
    getAllInternshipJobEntriesService,
}