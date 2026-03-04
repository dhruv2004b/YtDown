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

    if (!req.body?.url) {
      return res.status(400).json({
        success: false,
        message: "Video URL required"
      });
    }

    const { url } = req.body;

    const videoId = new URL(url).searchParams.get("v");

    // check cache
    const cached = videoCache.get(videoId);
    if (cached) {
      return res.json(cached);
    }

    const info = await yt(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true
    });

    const formats = Object.values(
      info.formats
        .filter(f => f.ext === "mp4" && f.height)
        .reduce((acc, cur) => {

          if (!acc[cur.height]) {
            acc[cur.height] = {
              quality: `${cur.height}p`,
              size: cur.filesize
                ? (cur.filesize / 1024 / 1024).toFixed(2) + " MB"
                : "Unknown",
              url: cur.url
            };
          }

          return acc;

        }, {})
    ).sort((a, b) => parseInt(a.quality) - parseInt(b.quality));

    const response = {
      success: true,
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats
    };

    videoCache.set(videoId, response);

    res.json(response);

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