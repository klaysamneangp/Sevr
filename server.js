const express = require("express");
const app = express();
app.use(express.json());

const playerData = {};
const SECRET_KEY = process.env.SECRET_KEY || "siamcamp2025";

function auth(req, res, next) {
    const key = req.headers["x-secret-key"];
    if (key !== SECRET_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    next();
}

// POST /save - แมพเก่าส่งข้อมูลมาเก็บ
app.post("/save", auth, (req, res) => {
    const { userId, data } = req.body;
    if (!userId || data === undefined) {
        return res.status(400).json({ error: "Missing userId or data" });
    }
    playerData[userId] = data;
    console.log(`[SAVE] key=${userId}`);
    res.json({ success: true });
});

// GET /load/:userId - แมพใหม่ดึงข้อมูล
app.get("/load/:userId", auth, (req, res) => {
    const userId = decodeURIComponent(req.params.userId);
    const data = playerData[userId];
    if (data === undefined) {
        return res.status(404).json({ error: "Not found" });
    }
    console.log(`[LOAD] key=${userId}`);
    res.json({ success: true, data });
});

// GET /keys/:storeName - ดึงรายการ keys ของ store นั้น
app.get("/keys/:storeName", auth, (req, res) => {
    const storeName = req.params.storeName;
    const prefix = storeName + ":";
    const keys = Object.keys(playerData)
        .filter(k => k.startsWith(prefix))
        .map(k => k.slice(prefix.length));
    console.log(`[KEYS] store=${storeName} count=${keys.length}`);
    res.json({ success: true, keys });
});

// GET /allkeys - ดึง keys ทั้งหมด
app.get("/allkeys", auth, (req, res) => {
    const keys = Object.keys(playerData);
    console.log(`[ALLKEYS] count=${keys.length}`);
    res.json({ success: true, keys });
});

// GET /count - ดูว่ามีข้อมูลกี่ keys
app.get("/count", auth, (req, res) => {
    res.json({ count: Object.keys(playerData).length });
});

// GET / - Health check
app.get("/", (req, res) => {
    res.json({ status: "SiamCamp API Server Running ✅" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
