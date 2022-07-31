import { NextFunction, Request, Response } from "express";
import { Model, PopulateOptions } from "mongoose";

import { AppError } from "../../utils/responses/error";
import { catchAsync } from "../../utils/catchAsync";
import { APIFeatures } from "../../utils/apiFeatures";

export const deleteOne = (DocModel: Model<any>) =>
  // eslint-disable-next-line consistent-return
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await DocModel.findByIdAndRemove(req.params.id);

    if (!doc) {
      return next(
        new AppError("NotFoundException", "No document found with that ID")
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

export const updateOne = (DocModel: Model<any>) =>
  // eslint-disable-next-line consistent-return
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await DocModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError("NotFoundException", "No document found with that ID")
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

export const createOne = (DocModel: Model<any>) =>
  // eslint-disable-next-line consistent-return, no-unused-vars
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await DocModel.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

export const getOne = (
  DocModel: Model<any>,
  populateOptions: PopulateOptions
) =>
  // eslint-disable-next-line consistent-return
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = DocModel.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError("NotFoundException", "No document found with that ID")
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

export const getAll = (DocModel: Model<any>) =>
  // eslint-disable-next-line consistent-return , no-unused-vars
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    const features = new APIFeatures(DocModel.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
