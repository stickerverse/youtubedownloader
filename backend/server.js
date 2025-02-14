const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

app.get("/", (req, res) => {
    res.send("Server is up and running!");
});

// Enable CORS properly
app.use(cors({
    origin: "*",  // Allow frontend requests for development, adjust for production
    methods: "GET,POST, OPTIONS",
    allowedHeaders: "Content-Type",
}));

app.use(express.json());

app.post("/download", (req, res) => {
    const { url, type } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided." });
    }

    const format = type === "audio" ? "bestaudio" : "best"; // Select format based on type
    const outputFilePath = path.join(downloadsDir, "%(title)s.%(ext)s");

    // Construct the yt-dlp command
    const command = `yt-dlp -o "${outputFilePath}" -f ${format} "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).json({ error: "Download failed." });
        }

        console.log(stdout);  // Log stdout for debugging

        // Use a more flexible approach to extract the file name
        const match = stdout.match(/Destination:\s([^\n]+)/);
        const fileName = match ? path.basename(match[1].trim()) : null;

        if (fileName) {
            const downloadLink = `http://localhost:5001/files/${fileName}`;
            res.json({ file: fileName, downloadLink: downloadLink });
        } else {
            res.status(500).json({ error: "Could not determine file name." });
        }
    });
});

app.use("/files", express.static(downloadsDir));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
