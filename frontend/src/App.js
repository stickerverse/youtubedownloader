import React, { useState } from "react";
import axios from "axios";

function App() {
    const [url, setUrl] = useState("");
    const [downloadLink, setDownloadLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("video"); // Default to video

    const isValidUrl = (inputUrl) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|co\.uk)\/.+$/;
        return regex.test(inputUrl);
    };

    const handleDownload = async () => {
        if (!url) {
            alert("Please enter a YouTube URL");
            return;
        }
        if (!isValidUrl(url)) {
            alert("Please enter a valid YouTube URL.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5001/download", { url, type });

            if (response.data.file) {
                setDownloadLink(response.data.downloadLink); // Update download link
            } else {
                alert("Download failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error downloading the video.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>YouTube Downloader</h1>
            <input
                type="text"
                placeholder="Enter YouTube URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ padding: "10px", width: "300px", marginRight: "10px" }}
            />
            <div style={{ margin: "20px 0" }}>
                <label>
                    <input
                        type="radio"
                        value="video"
                        checked={type === "video"}
                        onChange={() => setType("video")}
                    />
                    Video
                </label>
                <label style={{ marginLeft: "10px" }}>
                    <input
                        type="radio"
                        value="audio"
                        checked={type === "audio"}
                        onChange={() => setType("audio")}
                    />
                    Audio
                </label>
            </div>
            <button onClick={handleDownload} style={{ padding: "10px" }} disabled={loading}>
                {loading ? "Downloading..." : "Download"}
            </button>

            {downloadLink && (
                <div style={{ marginTop: "20px" }}>
                    <a href={downloadLink} download>
                        <button style={{ padding: "10px", backgroundColor: "green", color: "white" }}>
                            Download {type === "audio" ? "Audio" : "Video"}
                        </button>
                    </a>
                </div>
            )}
        </div>
    );
}

export default App;
