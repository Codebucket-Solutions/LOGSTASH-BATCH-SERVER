/**
 *
 * This middleware checks the centralised error handling. All the error thrown by the controllers is handled
 * by this middleware.
 *
 *
 * @param {*} err -> Custom Error Handler
 * @param {*} res -> Express response object
 */
import { Response } from "express";

const handleError = (err: Error, res: Response) => {
  const { message } = err;
  res.status(500).json({
    status: "failure",
    statusCode: 500,
    message,
  });
};

export default handleError;
