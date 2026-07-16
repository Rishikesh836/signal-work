import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import leadsRoutes from "./routes/leads.js";
import contactsRoutes from "./routes/contacts.js";
import interactionsRoutes from "./routes/interactions.js";
import draftsRoutes from "./routes/drafts.js";
import dashboardRoutes from "./routes/dashboard.js";
import importExportRoutes from "./routes/import-export.js";
import scoutRoutes from "./routes/scout.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);

  app.use("/api", requireAuth);
  // import-export and interactions/drafts declare specific sub-paths (/import, /export,
  // /:id/interactions, /:id/drafts) and must be mounted before leadsRoutes' generic
  // GET/PATCH/DELETE /:id routes, which would otherwise swallow them.
  app.use("/api/leads", importExportRoutes);
  app.use("/api/leads", interactionsRoutes);
  app.use("/api/leads", draftsRoutes);
  app.use("/api/leads", leadsRoutes);
  app.use("/api/contacts", contactsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/scout", scoutRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
