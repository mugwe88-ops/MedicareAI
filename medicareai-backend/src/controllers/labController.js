import express from "express";
// Import both controller functions to resolve the ReferenceError
import { addLabResult, getMyResults } from "../controllers/labController.js";
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();

/**
 * POST /api/results/results
 * Note: If mounted as app.use("/api/results", labRoutes) in server.js, 
 * this endpoint becomes /api/results/results
 */
router.post("/results", verifyToken, addLabResult);

/**
 * GET /api/results/my-results
 * Used by the patient portal to fetch lab reports
 */
router.get("/my-results", verifyToken, getMyResults);

export default router;