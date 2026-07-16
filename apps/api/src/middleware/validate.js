import { HttpError } from "./errorHandler.js";

export function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => {
      const value = req.body?.[field];
      return value === undefined || value === null || value === "";
    });
    if (missing.length) {
      return next(new HttpError(400, `Missing required field(s): ${missing.join(", ")}`));
    }
    next();
  };
}
