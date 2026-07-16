import { Router } from "express";
import { prisma } from "../db/client.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";
import { ROLE_RANK } from "@signalwork/shared";

const router = Router();

function serializeLead(lead) {
  return {
    ...lead,
    signals: JSON.parse(lead.signals || "[]"),
    contacts: (lead.contacts || [])
      .slice()
      .sort((a, b) => (ROLE_RANK[a.role] ?? 99) - (ROLE_RANK[b.role] ?? 99)),
  };
}

// GET /api/leads?search=&tier=&status=&page=&pageSize=
router.get("/", async (req, res, next) => {
  try {
    const { search, tier, status, page = "1", pageSize = "20" } = req.query;
    const take = Math.min(Number(pageSize) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const where = { AND: [] };
    if (tier) where.AND.push({ tier });
    if (status) where.AND.push({ status });
    if (search) {
      const s = String(search);
      where.AND.push({
        OR: [
          { company: { contains: s } },
          { contact: { contains: s } },
          { designation: { contains: s } },
          { email: { contains: s } },
          { signals: { contains: s } },
          { contacts: { some: { OR: [
            { name: { contains: s } },
            { designation: { contains: s } },
            { role: { contains: s } },
          ] } } },
        ],
      });
    }
    if (!where.AND.length) delete where.AND;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { contacts: true },
        orderBy: { updatedAt: "desc" },
        take,
        skip,
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({
      leads: leads.map(serializeLead),
      total,
      page: Number(page) || 1,
      pageSize: take,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", validateBody(["company"]), async (req, res, next) => {
  try {
    const b = req.body;
    const lead = await prisma.lead.create({
      data: {
        company: b.company,
        contact: b.contact ?? null,
        designation: b.designation ?? null,
        email: b.email ?? null,
        phone: b.phone ?? null,
        profileUrl: b.profileUrl ?? null,
        sourceUrl: b.sourceUrl ?? null,
        industry: b.industry ?? null,
        source: b.source ?? null,
        signals: JSON.stringify(b.signals ?? []),
        tier: b.tier ?? "B",
        status: b.status ?? "Researched",
        nextFollowUp: b.nextFollowUp ? new Date(b.nextFollowUp) : null,
        channel: b.channel ?? null,
        offering: b.offering ?? null,
      },
      include: { contacts: true },
    });
    res.status(201).json(serializeLead(lead));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { contacts: true },
    });
    if (!lead) throw new HttpError(404, "Lead not found");
    res.json(serializeLead(lead));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const b = req.body;
    const data = {};
    for (const field of [
      "company", "contact", "designation", "email", "phone", "profileUrl",
      "sourceUrl", "industry", "source", "tier", "status", "channel", "offering",
    ]) {
      if (b[field] !== undefined) data[field] = b[field];
    }
    if (b.signals !== undefined) data.signals = JSON.stringify(b.signals);
    if (b.nextFollowUp !== undefined) {
      data.nextFollowUp = b.nextFollowUp ? new Date(b.nextFollowUp) : null;
    }

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data,
      include: { contacts: true },
    });
    res.json(serializeLead(lead));
  } catch (err) {
    if (err.code === "P2025") return next(new HttpError(404, "Lead not found"));
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") return next(new HttpError(404, "Lead not found"));
    next(err);
  }
});

// Nested contact creation
router.post("/:id/contacts", validateBody(["role", "name"]), async (req, res, next) => {
  try {
    const b = req.body;
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) throw new HttpError(404, "Lead not found");

    const contact = await prisma.contact.create({
      data: {
        leadId: req.params.id,
        role: b.role,
        name: b.name,
        designation: b.designation ?? null,
        email: b.email ?? null,
        phone: b.phone ?? null,
        profileUrl: b.profileUrl ?? null,
        sortOrder: b.sortOrder ?? 0,
      },
    });
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

export default router;
