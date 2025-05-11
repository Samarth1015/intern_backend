"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_s3_1 = require("@aws-sdk/client-s3");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtverify_1 = __importDefault(require("../../../Service/JWTservice/jwtverify"));
const s3client_1 = require("../../../util/s3client");
const router = (0, express_1.Router)();
router.get("/", (async (req, res) => {
    console.log("hitting fetch bucket");
    try {
        // Get the JWT token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "No token provided",
            });
        }
        const token = authHeader.split(" ")[1];
        // Get refresh token from request header
        const refreshToken = req.headers["x-refresh-token"];
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: "No refresh token provided",
            });
        }
        let decoded;
        let accessToken = token;
        try {
            // First attempt with current access token
            decoded = jwtverify_1.default.verifyJWT(token);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                try {
                    // If token expired, try to refresh it
                    accessToken = await jwtverify_1.default.refreshAccessToken(refreshToken);
                    decoded = jwtverify_1.default.verifyJWT(accessToken);
                }
                catch (refreshError) {
                    return res.status(401).json({
                        success: false,
                        error: "Token refresh failed",
                    });
                }
            }
            else {
                return res.status(401).json({
                    success: false,
                    error: "Invalid token",
                });
            }
        }
        if (!decoded.accessKey || !decoded.secretAccessKey) {
            return res.status(400).json({
                success: false,
                error: "Invalid token: missing AWS credentials",
            });
        }
        // Create S3 client using the utility function
        const s3Client = (0, s3client_1.s3ClientPathStyle)(decoded.accessKey, decoded.secretAccessKey);
        // Fetch buckets
        const command = new client_s3_1.ListBucketsCommand({});
        const response = await s3Client.send(command);
        console.log("---->", response);
        const buckets = response.Buckets?.map((bucket) => ({
            name: bucket.Name,
            creationDate: bucket.CreationDate,
        })) || [];
        res.status(200).json({
            success: true,
            data: buckets,
            accessToken, // Send new access token if it was refreshed
        });
    }
    catch (error) {
        console.error("Error fetching buckets:", error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                error: "Invalid token",
            });
        }
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch buckets",
        });
    }
}));
exports.default = router;
