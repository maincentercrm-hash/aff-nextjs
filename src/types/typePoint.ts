import type { ObjectId } from "mongodb";

export type TypePoint = {
  _id?: ObjectId;
  title: string;
  thumbnail: string;
  point: number;
  type: 'credit' | 'default';
  status: string;
  createDate: Date;
}
