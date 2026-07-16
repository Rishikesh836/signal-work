import { Router } from "express";
import multer from "multer";
import { prisma } from "../db/client.js";
import { parseLeadsCsv, buildLeadsCsv } from "../services/csv.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/import", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "CSV file is required (field name: file)");

    const { valid, errors } = parseLeadsCsv(req.file.buffer);

    const created = [];
    for (const row of valid) {
      const { contacts, signals, ...leadData } = row;
      const lead = await prisma.lead.create({
        data: {
          ...leadData,
          signals: JSON.stringify(signals),
          source: leadData.source || "CSV import",
          contacts: { create: contacts },
        },
        include: { contacts: true },
      });
      created.push(lead);
    }

    res.status(errors.length ? 207 : 201).json({
      imported: created.length,
      failed: errors.length,
      errors,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/export", async (req, res, next) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { contacts: true, interactions: true },
      orderBy: { updatedAt: "desc" },
    });
    const csv = buildLeadsCsv(leads);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="leads-export.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

export default router;
