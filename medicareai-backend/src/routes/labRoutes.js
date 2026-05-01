import express from "express";
import { addLabResult } from "../controllers/labController.js";
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();

// POST /api/lab/results
router.post("/results", verifyToken, addLabResult);

router.get("/my-results", verifyToken, getMyResults);
export default router;