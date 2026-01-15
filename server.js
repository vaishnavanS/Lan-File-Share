const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Request Logging Middleware
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] Access: ${ip} - ${req.method} ${req.url}`);
    next();
});

const categories = {
    video: ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    audio: ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
};

const uploadDir = 'uploads';

const getCategory = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    for (const [category, extensions] of Object.entries(categories)) {
        if (extensions.includes(ext)) return category;
    }
    return 'others';
};

// Comprehensive migration logic
const migrateFiles = () => {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    const categoriesList = Object.keys(categories).concat('others');
    const allDirs = [uploadDir, ...categoriesList.map(cat => path.join(uploadDir, cat))];

    allDirs.forEach(currentDir => {
        if (!fs.existsSync(currentDir)) return;

        try {
            const items = fs.readdirSync(currentDir);
            items.forEach(item => {
                const itemPath = path.join(currentDir, item);
                if (fs.lstatSync(itemPath).isFile()) {
                    const correctCategory = getCategory(item);
                    const targetDir = path.join(uploadDir, correctCategory);
                    const targetPath = path.join(targetDir, item);

                    if (path.resolve(itemPath) !== path.resolve(targetPath)) {
                        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
                        fs.renameSync(itemPath, targetPath);
                        console.log(`[RE-MIGRATION] Moved: ${item} from ${path.basename(currentDir)} to ${correctCategory}/`);
                    }
                }
            });
        } catch (err) {
            console.error(`[MIGRATION ERROR] Failed in ${currentDir}:`, err);
        }
    });
};

migrateFiles();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = getCategory(file.originalname);
        cb(null, path.join(uploadDir, category));
    },
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

// Routes
app.post("/upload", upload.single("file"), (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!req.file) {
        console.log(`[UPLOAD FAILED] ${ip}: No file received`);
        return res.status(400).json({ message: "No file received" });
    }
    console.log(`[UPLOAD SUCCESS] ${ip}: ${req.file.originalname} (${req.file.size} bytes)`);
    res.json({ message: "Uploaded successfully" });
});

app.get("/files", async (req, res) => {
    const result = { video: [], audio: [], images: [], others: [] };
    const dirs = Object.keys(result);

    for (const dir of dirs) {
        const fullPath = path.join(uploadDir, dir);
        try {
            if (fs.existsSync(fullPath)) {
                const files = fs.readdirSync(fullPath);
                result[dir] = files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            }
        } catch (err) {
            console.error(`Error reading directory ${dir}:`, err);
        }
    }
    res.json(result);
});

app.get("/download/:name", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const fileName = req.params.name;

    let foundPath = null;
    ['video', 'audio', 'images', 'others'].forEach(cat => {
        const catPath = path.join(__dirname, uploadDir, cat, fileName);
        if (fs.existsSync(catPath)) {
            foundPath = catPath;
        }
    });

    if (foundPath) {
        console.log(`[DOWNLOAD] ${ip}: Requested "${fileName}"`);
        res.download(foundPath);
    } else {
        console.log(`[DOWNLOAD FAILED] ${ip}: File not found "${fileName}"`);
        res.status(404).json({ message: "File not found" });
    }
});

// Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server error occurred", error: err.message });
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
});
