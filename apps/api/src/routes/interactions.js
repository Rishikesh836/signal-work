import { Router } from "express";
import { prisma } from "../db/client.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";
import { INTERACTION_TYPES } from "@signalwork/shared";

const router = Router();

router.get("/:id/interactions", async (req, res, next) => {
  try {
    const interactions = await prisma.interaction.findMany({
      where: { leadId: req.params.id },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(interactions);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/interactions", validateBody(["type"]), async (req, res, next) => {
  try {
    const b = req.body;
    if (!INTERACTION_TYPES.includes(b.type)) {
      throw new HttpError(400, `type must be one of ${INTERACTION_TYPES.join(", ")}`);
    }

    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) throw new HttpError(404, "Lead not found");

    const interaction = await prisma.interaction.create({
      data: {
        leadId: req.params.id,
        contactId: b.contactId ?? null,
        type: b.type,
        content: b.content ?? null,
        tone: b.tone ?? null,
      },
      include: { contact: true },
    });
    res.status(201).json(interaction);
  } catch (err) {
    next(err);
  }
});

export default router;
