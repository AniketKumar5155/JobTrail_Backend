const express = require("express");
const {
    createInternshipJobEntryController,
    updateInternshipJobEntryController,
    getAllInternshipJobEntriesController,
    getApplicationByIdController
} = require("../controllers/internshipJobController");
const validateZodMiddleware = require("../middlewares/validateZodMiddleware");
const { createInternshipJobEntrySchema, updateInternshipJobEntrySchema } = require("../schemas/internshipJobSchema");
const authMiddleware = require("../middlewares/authMiddleware");

const internshipJobRouter = express.Router();

internshipJobRouter.post(
    `/create-entry`,
    authMiddleware,
    validateZodMiddleware(createInternshipJobEntrySchema),
    createInternshipJobEntryController,
)

internshipJobRouter.patch(
    `/update-entry/:id`,
    authMiddleware,
    validateZodMiddleware(updateInternshipJobEntrySchema),
    updateInternshipJobEntryController,
)

internshipJobRouter.get(
    `/get-all-entries`,
    authMiddleware,
    getAllInternshipJobEntriesController,
)

internshipJobRouter.get(
    '/get-application/:id',
    authMiddleware,
    getApplicationByIdController,
)

module.exports = internshipJobRouter;