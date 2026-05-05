import express from "express";
import { addLabResult, getMyResults } from "../controllers/labController.js";
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();

// Used by Doctors/Lab Techs to upload results
router.post("/results", verifyToken, addLabResult);

// Used by Patients to view their own results
router.get("/my-results", verifyToken, getMyResults);

export default router;