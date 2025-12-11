import type { ObjectId } from "mongodb";

export type TypeCommunity = {
  _id?: ObjectId;
  title: string;
  excerpt: string;
  url: string;
  category: string;
  status: string;
  createDate: Date;
}
