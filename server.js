const express = require("express");
const app = express();

app.use(express.json({ limit: "10mb" }));

const SECRET_KEY = process.env.SECRET_KEY || "siamcamp2025";

// 💾 เก็บข้อมูล
const playerData = {};

// 🔐 auth
function auth(req, res, next) {
    const key = req.headers["x-secret-key"];
    if (key !== SECRET_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    next();
}

// 🔥 merge function (กัน data หาย)
function deepMerge(target, source) {
    for (const key in source) {
        if (
            typeof source[key] === "object" &&
            source[key] !== null &&
            !Array.isArray(source[key])
        ) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

// ================== SAVE ==================
app.post("/save", auth, (req, res) => {
    const { userId, data } = req.body;

    if (!userId || data === undefined) {
        return res.status(400).json({ error: "Missing userId or data" });
    }

    if (!playerData[userId]) {
        playerData[userId] = {};
    }

    deepMerge(playerData[userId], data);

    console.log("✅ SAVE:", userId);
    console.log("DATA:", JSON.stringify(playerData[userId], null, 2));

    res.json({ success: true });
});

// ================== LOAD ==================
app.get("/load/:userId", auth, (req, res) => {
    const userId = req.params.userId;
    const data = playerData[userId];

    if (!data) {
        return res.status(404).json({ error: "Not found" });
    }

    console.log("📥 LOAD:", userId);

    res.json({ success: true, data });
});

// ================== DEBUG ==================
app.get("/debug/:userId", auth, (req, res) => {
    res.json(playerData[req.params.userId] || {});
});

app.get("/count", auth, (req, res) => {
    res.json({ count: Object.keys(playerData).length });
});

app.get("/", (req, res) => {
    res.send("🚀 API READY");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🔥 API RUNNING");
});
