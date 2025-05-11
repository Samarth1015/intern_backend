"use strict";
// routes/upload.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const jwtverify_1 = __importDefault(require("../../../Service/JWTservice/jwtverify"));
const s3client_1 = require("../../../util/s3client");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post("/", upload.single("file"), async (req, res) => {
    try {
        console.log(req.file);
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid token" });
        }
        const token = authHeader.split(" ")[1];
        const { accessKey, secretAccessKey } = jwtverify_1.default.verifyJWT(token);
        const bucket = req.body.bucket;
        const file = req.file;
        console.log("Received bucket:", bucket);
        console.log("Received file:", file?.originalname);
        if (!bucket || !file) {
            return res.status(400).json({ error: "Bucket name or file missing" });
        }
        const s3 = (0, s3client_1.s3ClientPathStyle)(accessKey, secretAccessKey);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket.trim(),
            Key: file.originalname,
            Body: file.buffer,
        });
        await s3.send(command);
        return res.status(200).json({ message: "File uploaded successfully" });
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Failed to upload file" });
    }
});
exports.default = router;
