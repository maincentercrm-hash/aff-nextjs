import type { ObjectId } from "mongodb";

export type TypePoint = {
  _id?: ObjectId;
  title: string;
  thumbnail: string;
  point: number;
  reward?: number; // จำนวนเครดิตที่จะได้รับ (สำหรับ type: credit)
  type: 'credit' | 'default';
  status: string;
  createDate: Date;
}
