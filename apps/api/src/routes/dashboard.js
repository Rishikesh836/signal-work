import { Router } from "express";
import { prisma } from "../db/client.js";
import { TIERS, STATUSES } from "@signalwork/shared";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [leads, interactions] = await Promise.all([
      prisma.lead.findMany(),
      prisma.interaction.findMany(),
    ]);

    const tierCounts = Object.fromEntries(TIERS.map((t) => [t, 0]));
    leads.forEach((l) => { if (tierCounts[l.tier] !== undefined) tierCounts[l.tier] += 1; });

    const funnel = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    leads.forEach((l) => { if (funnel[l.status] !== undefined) funnel[l.status] += 1; });

    const sentCount = interactions.filter((i) => i.type === "email_sent" || i.type === "linkedin_sent").length;
    const responseCount = interactions.filter((i) => i.type === "response").length;
    const responseRate = sentCount > 0 ? responseCount / sentCount : 0;

    const now = new Date();
    const followUps = leads
      .filter((l) => l.nextFollowUp)
      .map((l) => ({
        id: l.id,
        company: l.company,
        nextFollowUp: l.nextFollowUp,
        overdue: new Date(l.nextFollowUp) < now,
      }))
      .sort((a, b) => new Date(a.nextFollowUp) - new Date(b.nextFollowUp));

    res.json({
      totalLeads: leads.length,
      tierCounts,
      funnel,
      responseRate,
      sentCount,
      responseCount,
      followUps,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
