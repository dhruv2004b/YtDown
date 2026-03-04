import express from "express";
import { downloadMp3, downloadVideo, getVideoInfo } from "../controllers/video.controller.js";

const router = express.Router();

router.post("/info", getVideoInfo);

router.get("/download", downloadVideo);

router.get("/mp3", downloadMp3);

export default router;