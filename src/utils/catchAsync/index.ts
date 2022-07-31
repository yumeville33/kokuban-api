import { RequestHandler } from "express";

export const catchAsync = (fn: Function): RequestHandler => {
  return (req, res, next): void => {
    fn(req, res, next).catch(next);
  };
};
