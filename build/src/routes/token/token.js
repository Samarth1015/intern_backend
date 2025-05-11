"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// E:\intern_backend\src\routes\token\token.ts
const express_1 = require("express");
const jwtverify_1 = __importDefault(require("../../../Service/JWTservice/jwtverify"));
const db_1 = require("../../../client/db");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        console.log("req in verify");
        const { googleToken, accesskey, secretaccesskey } = (await req.body);
        if (!googleToken || !accesskey || !secretaccesskey) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const result = await jwtverify_1.default.tokenVerify(googleToken);
        if ("error" in result) {
            const error = result;
            res.status(401).json({
                message: "Google token verification failed",
                details: error.error_description,
            });
            return;
        }
        const decodedPayload = result;
        console.log("Decoded Google User:", decodedPayload);
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: decodedPayload.email },
        });
        if (!existingUser) {
            const newUser = await db_1.prisma.user.create({
                data: {
                    email: decodedPayload.email,
                    name: decodedPayload.given_name,
                    accessKeyID: accesskey,
                    secretAccesskeyId: secretaccesskey,
                },
            });
            return res
                .status(200)
                .json({ token: await jwtverify_1.default.generateJWT(newUser.id) });
        }
        res
            .status(200)
            .json({ token: await jwtverify_1.default.generateJWT(existingUser.id) });
    }
    catch (err) {
        console.error("Error in /token route:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
