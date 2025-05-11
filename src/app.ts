// E:\intern_backend\src\app.ts
import express from "express";
import cors from "cors";
import testRoutes from "./routes/test/test";
import token from "./routes/token/token";
import upload from "./routes/upload/upload";
import fetchfile from "./routes/fetchfile/fetchfile";
import isCred from "./routes/isCredGiven/isCregGive";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/isCred", isCred);
app.use("/api/fetchfile", fetchfile);
app.use("/api/upload", upload);
app.use("/api/verifyGoogleToken", token);
app.use("/api/test", testRoutes);

export default app;
