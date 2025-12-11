import type { ObjectId } from "mongodb";

export type TypeSupport = {
  _id?: ObjectId;
  title: string;
  excerpt: string;
  thumbnail: string;
  status: string;
  createDate: Date;
}
