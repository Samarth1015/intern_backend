"use strict";
// File: E:/intern_backend/src/routes/fetchfile/fetchfile.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const jwtverify_1 = __importDefault(require("../../../Service/JWTservice/jwtverify"));
const s3client_1 = require("../../../util/s3client");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    try {
        // Log the body to check if it's parsed
        const bucket = req.body;
        console.log("bucket name:", bucket);
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid token" });
        }
        const token = authHeader.split(" ")[1];
        try {
            const { accessKey, secretAccessKey } = jwtverify_1.default.verifyJWT(token);
            if (!bucket || !accessKey || !secretAccessKey) {
                return res
                    .status(400)
                    .json({ error: "Missing bucket name or token credentials" });
            }
            const s3 = (0, s3client_1.s3ClientPathStyle)(accessKey, secretAccessKey);
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: bucket.bucket.trim(),
            });
            const response = await s3.send(command);
            const files = [];
            if (response.Contents) {
                for (const item of response.Contents) {
                    if (item.Key) {
                        const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.GetObjectCommand({
                            Bucket: bucket.bucket.trim(),
                            Key: item.Key,
                        }), { expiresIn: 3600 });
                        files.push({
                            key: item.Key,
                            pathStyleUrl: presignedUrl,
                            virtualHostUrl: undefined,
                        });
                    }
                }
            }
            return res.json(files);
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    error: "Token expired",
                    code: "TOKEN_EXPIRED",
                });
            }
            throw error;
        }
    }
    catch (error) {
        console.error("Error listing files:", error);
        return res.status(500).json({ error: "Failed to list files" });
    }
});
exports.default = router;
