import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
dotenv.config();
import queueRoute from "./routes/queue-route";
import handleError from "./middleware/handle-error";

const app: Express = express();
const port = process.env.PORT || 3000;

app
  .use(cors())
  .use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 50000,
    })
  )
  .use(bodyParser.json({ limit: "100mb" }))
  .use(queueRoute);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleError(err, res);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
  });
