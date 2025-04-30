const express = require("express");
const { prompt, healthCheck } = require("../service/promptService");

const router = express.Router();

router.post("/", prompt);
router.post("/health-check", healthCheck);
