import { yt } from "../config/yt.js";
import { videoCache } from "../utils/cache.js";
import { spawn } from "child_process";

export const downloadVideo = async (req, res) => {
  try {

    const { url, quality } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Video URL required"
      });
    }

    const format = quality
      ? `bestvideo[height<=${quality}]+bestaudio/best`
      : "best";

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    const process = spawn("yt-dlp", [
      "-f",
      format,
      "-o",
      "-",
      url
    ]);

    process.stdout.pipe(res);

    process.stderr.on("data", (data) => {
      console.log("yt-dlp:", data.toString());
    });

    process.on("close", (code) => {
      console.log("yt-dlp finished with code", code);
    });

  } catch (error) {

    console.error("DOWNLOAD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Download failed"
    });

  }
};


export const getVideoInfo = async (req, res) => {

  try {

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Video URL required"
      });
    }

    const process = spawn("yt-dlp", [
      url,
      "--dump-single-json",
      "--no-warnings",
      "--no-call-home"
    ]);

    let data = "";

    process.stdout.on("data", chunk => {
      data += chunk.toString();
    });

    process.stderr.on("data", err => {
      console.log("yt-dlp:", err.toString());
    });

    process.on("close", () => {

      const info = JSON.parse(data);

      res.json({
        success: true,
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration
      });

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to process video"
    });

  }

};


export const downloadMp3 = async (req, res) => {
  try {

    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Video URL required"
      });
    }

    res.setHeader("Content-Disposition", 'attachment; filename="audio.mp3"');
    res.setHeader("Content-Type", "audio/mpeg");

    const ytdlp = spawn("yt-dlp", [
      "-f",
      "bestaudio",
      "-o",
      "-",
      url
    ]);

    const ffmpeg = spawn("ffmpeg", [
      "-i",
      "pipe:0",
      "-vn",
      "-ab",
      "192k",
      "-f",
      "mp3",
      "pipe:1"
    ]);

    ytdlp.stdout.pipe(ffmpeg.stdin);
    ffmpeg.stdout.pipe(res);

    ytdlp.stderr.on("data", (data) => {
      console.log("yt-dlp:", data.toString());
    });

    ffmpeg.stderr.on("data", (data) => {
      console.log("ffmpeg:", data.toString());
    });

  } catch (error) {

    console.error("MP3 ERROR:", error);

    res.status(500).json({
      success: false,
      message: "MP3 download failed"
    });

  }
};