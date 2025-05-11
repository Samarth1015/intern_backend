"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// E:\intern_backend\Service\JWTservice\jwtverify.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../client/db");
class JWTService {
    static async tokenVerify(googleToken) {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${googleToken}` },
            method: "GET",
        });
        const data = await res.json();
        if (!res.ok || data.error) {
            return {
                error: data.error || "invalid_request",
                error_description: data.error_description || "Invalid token",
            };
        }
        return data;
    }
    static async generateJWT(id) {
        const secret = process.env.JWT_SECRET || "defaultsecret";
        const user = await db_1.prisma.user.findUnique({ where: { id: id } });
        const payload = {
            id: user?.id,
            email: user?.email,
            accessKey: user?.accessKeyID,
            secretAccessKey: user?.secretAccesskeyId,
        };
        const token = jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: "2h",
        });
        return token;
    }
    static verifyJWT(token) {
        const secret = process.env.JWT_SECRET || "defaultsecret";
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            return decoded;
        }
        catch (err) {
            throw new Error("Invalid or expired token");
        }
    }
}
exports.default = JWTService;
