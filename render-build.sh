#!/usr/bin/env bash

echo "Installing yt-dlp..."
pip install yt-dlp

echo "Downloading static ffmpeg..."

curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz

tar -xvf ffmpeg.tar.xz

FF_DIR=$(find . -type d -name "ffmpeg-*amd64-static")

cp $FF_DIR/ffmpeg /usr/local/bin/ffmpeg
cp $FF_DIR/ffprobe /usr/local/bin/ffprobe

chmod +x /usr/local/bin/ffmpeg
chmod +x /usr/local/bin/ffprobe

echo "FFmpeg installed successfully"