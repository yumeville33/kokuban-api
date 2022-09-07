import mongoose, { Schema } from "mongoose";

import { IContent, ImageType } from "../Content";

export interface IStudentAnswer extends IContent {
  image: ImageType;
  boardRef: Schema.Types.ObjectId;
  boardOwner: Schema.Types.ObjectId;
  studentName: String;
  grade: Number;
  timeSubmitted: Date;
}

const studentAnswerSchema = new mongoose.Schema<IStudentAnswer>(
  {
    content: [
      {
        id: Number,
        toolType: String,
        color: String,
        points: [{ type: Number }],
        size: {
          width: Number,
          height: Number,
          size: Number,
        },
        radius: Number,
        shapeType: String,
        sides: Number,
        originalSize: {
          width: Number,
          height: Number,
        },
        image: {
          uri: {
            type: Buffer,
            contentType: String,
          },
          extensionType: String,
        },
        text: String,
        position: {
          x: Number,
          y: Number,
        },
      },
    ],
    image: {
      uri: {
        type: Buffer,
        contentType: String,
      },
      extensionType: String,
    },
    boardRef: {
      type: Schema.Types.ObjectId,
      ref: "Content",
    },
    boardOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    grade: {
      type: Number,
      default: 0,
    },
    studentName: String,
    timeSubmitted: Date,
  },
  {
    timestamps: true,
  }
);

const StudentAnswer = mongoose.model("StudentAnswer", studentAnswerSchema);

export default StudentAnswer;
