import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env dari root project, bukan dari CWD
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import scrapingRouter from "./routes/scraping.js";
import regionsRouter from "./routes/regions.js";
import leadsRouter from "./routes/leads.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Validasi env vars penting
const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[ERROR] Env vars tidak ditemukan: ${missing.join(", ")}`);
  console.error(`[ERROR] Pastikan file .env ada di root project dan berisi variabel tersebut.`);
  process.exit(1);
}

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/regions", regionsRouter);
app.use("/api/scraping", scrapingRouter);
app.use("/api/leads", leadsRouter);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(`SerpAPI: ${process.env.SERPAPI_KEY ? "terkonfigurasi" : "tidak ada (pakai mock data)"}`);
});
