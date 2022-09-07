import express, { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import hpp from "hpp";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { contentRouter, studentAnswerRouter, userRouter } from "./routes";
import { globalErrorHandler } from "./controllers/error";

dotenv.config();

// const xss = require("xss-clean");

const PORT = process.env.PORT || 8000;

const main = async () => {
  const app = express();

  const corsOptions = {
    origin: "*",
    // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // preflightContinue: false,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(helmet());

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // app.use(express.json());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb" }));
  app.use(express.static("public"));

  app.use(mongoSanitize());
  app.use(xss());
  app.use(
    hpp({
      whitelist: [],
    })
  );

  app.use("/api/users/", userRouter);
  app.use("/api/content/", contentRouter);
  app.use("/api/student/", studentAnswerRouter);

  app.use(() => {
    throw createHttpError(404, "Page not found");
  });

  // @ts-ignore
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log(err.message, err.statusCode);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(err.statusCode || 500).json({ message: err.message });
  };

  app.use(errorHandler);

  app.use(globalErrorHandler);

  mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(() => {
      app.listen(PORT, () => {
        // console.clear();
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch(() => {
      throw createHttpError(501, "Unable to connect to database");
    });
};

main();
