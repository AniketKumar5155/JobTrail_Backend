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

    const [newEntry] = await pool.query(
        `INSERT INTO applied_internship_jobs
         (user_id, company_name, role, category, status, source, job_url, referral, location, salary_range, applied_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, company_name, role, category, status, source, job_url, referral, location, salary_range, applied_date || null, notes]
    );

    const [row] = await pool.query(
        `SELECT id, user_id, company_name, role, category, status, source, job_url, referral, location, salary_range, applied_date, notes
         FROM applied_internship_jobs WHERE id = ?`,
        [newEntry.insertId]
    )

    const newEntryData = row[0];

    return newEntryData
}

const updateInternshipJobEntryService = async (userId, entryId, data) => {
    const fields = [];
    const values = [];

    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    if (fields.length === 0) {
        throw new Error("No valid fields provided for update")
    }

    values.push(entryId, userId);

    await pool.query(
        `UPDATE applied_internship_jobs
         SET ${fields.join(`,`)}
         WHERE id = ? AND user_id =?`,
        values
    )

    const [row] = await pool.query(
        `SELECT id, user_id, company_name, role, category, status, source, job_url, referral, location, salary_range, applied_date, notes, rejection_reason, is_active
        FROM applied_internship_jobs
        WHERE id = ? AND user_id = ?`,
        [entryId, userId]
    )

    const updatedEntry = row[0];

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
    const buildClause = [`user_id = ?`];

    // Filters
    if (filters.category) {
        buildClause.push(`category = ?`);
        values.push(filters.category);
    }

    if (filters.status) {
        if (filters.status === "NULL") {
            buildClause.push(`status IS NULL`);
        } else {
            buildClause.push(`status = ?`);
            values.push(filters.status);
        }
    }

    if (filters.dateFrom) {
        buildClause.push(`applied_date >= ?`);
        values.push(filters.dateFrom);
    }

    if (filters.dateTo) {
        buildClause.push(`applied_date <= ?`);
        values.push(filters.dateTo);
    }

    // Text search
    if (filters.search) {
        buildClause.push(`(
            company_name LIKE ? OR 
            role LIKE ? OR 
            rejection_reason LIKE ? OR 
            notes LIKE ? OR 
            location LIKE ? OR 
            source LIKE ? OR 
            referral LIKE ? OR 
            salary_range LIKE ?
        )`);
        const searchValue = `%${filters.search}%`;
        values.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
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

    const [rows] = await pool.query(sql, values);

    // Count total for pagination
    let countSQL = `SELECT COUNT(*) AS total FROM applied_internship_jobs`;
    if (buildClause.length > 0) countSQL += " WHERE " + buildClause.join(" AND ");
    const [countResult] = await pool.query(countSQL, values.slice(0, values.length - 2));

    return {
            rows,
            totalItemsPerPage: limit,
            totalItems: countResult[0].total,
            currentPage: page,
            totalPages: Math.ceil(countResult[0].total / limit),
        }
};


module.exports = {
    createInternshipJobEntryService,
    updateInternshipJobEntryService,
    getAllInternshipJobEntriesService,
}