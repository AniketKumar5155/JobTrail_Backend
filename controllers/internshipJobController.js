const asyncHandlerMiddleware = require("../middlewares/asyncHandlerMiddleware");
const {
    createInternshipJobEntryService,
    updateInternshipJobEntryService,
    getAllInternshipJobEntriesService,
} = require("../services/internshipJobService");
const validateId = require("../utils/validateId");

const createInternshipJobEntryController = asyncHandlerMiddleware(async (req, res) => {
    const userId = req.user.id;
    validateId(userId);

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
    } = req.body;

    const data = {
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
    }

    const newEntry = await createInternshipJobEntryService(userId, { data });

    return res.status(201).json({
        success: true,
        message: `InternshipJobEntry created successfully`,
        data: newEntry,
    });
});

const updateInternshipJobEntryController = asyncHandlerMiddleware(async (req, res) => {
    const userId = req.user.id;
    const entryId = req.params.id;
    const payload = req.body;
    validateId(userId);
    validateId(entryId);

    const updatedEntry = await updateInternshipJobEntryService(userId, entryId, payload);

    return res.status(200).json({
        success: true,
        message: `InternshipJobEntry updated successfully`,
        data: updatedEntry,
    });
});

const getAllInternshipJobEntriesController = asyncHandlerMiddleware(async (req, res) =>{
    const userId = req.user.id;

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const filters = {
        category: req.query.category,
        status: req.query.status,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        search: req.query.search,
    }

    const sortType = req.query.sortType;
    const sortDirection = req.query.sortDirection;

    console.log(userId, limit, page, filters)

    const allInternshipJobEntries = await getAllInternshipJobEntriesService({
        userId,
        filters, 
        limit, 
        page,
        sortType,
        sortDirection,
    });

    return res.status(200).json({
        success: true,
        message: `All InternshipJobEntries fetched successfully`,
        data: allInternshipJobEntries,
    })
})

module.exports = {
    createInternshipJobEntryController,
    updateInternshipJobEntryController,
    getAllInternshipJobEntriesController,
}