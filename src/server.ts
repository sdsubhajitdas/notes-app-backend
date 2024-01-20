import cookieParser from "cookie-parser";
import express, { Router, json, urlencoded } from "express";
import helmet from "helmet";
import dotenv from "dotenv";

import authRouter from "./routes/auth";
import notesRouter from "./routes/notes";
import logRequests from "./middlewares/logRequests";
import ensureAuthenticated from "./middlewares/ensureAuthenticated";
import errorHandler from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// Hooking up middlewares
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(logRequests);
}

// Starting all the backend API routes with "/api"
const apiRouter = Router();
app.use("/api", apiRouter);

apiRouter.use("/auth", authRouter);

// Protected Routes
apiRouter.use(ensureAuthenticated);
apiRouter.use("/notes", notesRouter);

// Error handling middleware
apiRouter.use(errorHandler);


export default app;