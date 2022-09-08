import express, { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
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
    app.use(morgan("tiny"));
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

  app.get("/", (req, res) => {
    return res.send("Educapp API");
  });

  app.get("/health", (req, res) => {
    return res.status(200).json({
      message: "Server is up and running",
    });
  });

  app.use("/api/users/", userRouter);
  app.use("/api/contents/", contentRouter);
  app.use("/api/students/", studentAnswerRouter);

  // @ts-ignore
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    return res.status(err.statusCode || 500).json({ message: err.message });
  };

  app.use(errorHandler);

  app.use(globalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    mongoose
      .connect(process.env.MONGODB_URI as string)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

main();
