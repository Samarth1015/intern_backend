"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// E:\intern_backend\src\routes\isCredGiven\isCregGive.ts
const express_1 = require("express");
const jwtverify_1 = __importDefault(require("../../../Service/JWTservice/jwtverify"));
const db_1 = require("../../../client/db");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const email = await req.body.email;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid token" });
    }
    const token = authHeader.split(" ")[1];
    const user = await db_1.prisma.user.findUnique({ where: { id: id } });
    if (user) {
        const token = await jwtverify_1.default.generateJWT(user.id);
        return res.status(200).json({ present: true, token: token });
    }
    return res.status(200).json({ present: false });
});
exports.default = router;
