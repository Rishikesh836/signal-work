import { Router } from "express";
import { prisma } from "../db/client.js";
import { validateBody } from "../middleware/validate.js";
import { scoutLeads } from "../services/scout.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/", validateBody(["query"]), async (req, res, next) => {
  try {
    const results = await scoutLeads(req.body.query, req.body.platforms, req.body.timeRange, req.body.resultCount);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

router.post("/accept", validateBody(["company"]), async (req, res, next) => {
  try {
    const b = req.body;
    const lead = await prisma.lead.create({
      data: {
        company: b.company,
        industry: b.industry ?? null,
        sourceUrl: b.sourceUrl ?? null,
        tier: b.tier ?? "B",
        status: "Researched",
        source: "AI scout",
        signals: JSON.stringify(b.signal ? [b.signal] : []),
      },
      include: { contacts: true },
    });
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
});

export default router;
