import mongoose, { Document, Schema } from "mongoose";

export type ToolType =
  | "drag"
  | "image"
  | "shapes"
  | "text"
  | "pen"
  | "eraser"
  | "highlighter"
  | "undo"
  | "redo"
  | "clear";

export type ShapeType = "circle" | "square" | "triangle" | "rectangle";

export type PositionType = {
  x: number;
  y: number;
};

export type SizeType = {
  height: number;
  width: number;
  size: number;
};

export type IData = {
  id: number;
  toolType: ToolType;
  color: string;
};

export interface ILine extends IData {
  size: number;
  points: Array<number>;
}

export interface IShape extends IData {
  position: PositionType;
  shapeType: ShapeType;
  size?: SizeType;
  radius?: number;
  sides?: number;
}

export type ImageType = {
  uri: Buffer;
  extensionType: string;
};

export interface IImage extends IData {
  originalSize: SizeType;
  size: SizeType;
  image: ImageType;
  position: PositionType;
}

export type ContentType = Array<ILine | IShape | IImage>;

export interface IContent extends Document {
  content: ContentType;
  thumbnail: ImageType;
  createdAt: Date;
  updatedAt: Date;
  user: Schema.Types.ObjectId;
  code: string;
  title: string;
  active: boolean;
}

const contentSchema = new mongoose.Schema<IContent>(
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
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    thumbnail: {
      uri: {
        type: Buffer,
        contentType: String,
      },
      extensionType: String,
    },
    code: String,
    updatedAt: Date,
    title: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
