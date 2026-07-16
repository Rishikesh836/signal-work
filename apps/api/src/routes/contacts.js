import { Router } from "express";
import { prisma } from "../db/client.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();

router.patch("/:id", async (req, res, next) => {
  try {
    const b = req.body;
    const data = {};
    for (const field of ["role", "name", "designation", "email", "phone", "profileUrl", "sortOrder"]) {
      if (b[field] !== undefined) data[field] = b[field];
    }
    const contact = await prisma.contact.update({ where: { id: req.params.id }, data });
    res.json(contact);
  } catch (err) {
    if (err.code === "P2025") return next(new HttpError(404, "Contact not found"));
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") return next(new HttpError(404, "Contact not found"));
    next(err);
  }
});

export default router;
