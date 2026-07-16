import { Router } from "express";
import { prisma } from "../db/client.js";
import { HttpError } from "../middleware/errorHandler.js";
import { generateDraftVariants } from "../services/llm.js";
import { getHierarchyNudge } from "../services/hierarchyNudge.js";
import { OFFERINGS } from "@signalwork/shared";

const router = Router();

router.post("/:id/drafts", async (req, res, next) => {
  try {
    const { targetContactId, offerings } = req.body || {};

    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { contacts: true },
    });
    if (!lead) throw new HttpError(404, "Lead not found");

    let targetContact = null;
    if (targetContactId) {
      targetContact = lead.contacts.find((c) => c.id === targetContactId);
      if (!targetContact) throw new HttpError(400, "targetContactId does not belong to this lead");
    }

    const resolvedOfferings = (Array.isArray(offerings) && offerings.length ? offerings : OFFERINGS.slice(0, 1))
      .map((o) => ({ name: o.name, outcome: o.outcome }));
    const variants = await generateDraftVariants({ lead, targetContact, offerings: resolvedOfferings });

    const created = await Promise.all(
      Object.entries(variants).map(([tone, { subject, body }]) =>
        prisma.draft.create({
          data: {
            leadId: lead.id,
            targetContactId: targetContact?.id ?? null,
            tone,
            subject,
            body,
          },
        })
      )
    );

    const interactions = await prisma.interaction.findMany({ where: { leadId: lead.id } });
    const nudge = getHierarchyNudge({ targetContact, contacts: lead.contacts, interactions });

    res.status(201).json({ drafts: created, nudge });
  } catch (err) {
    next(err);
  }
});

export default router;
