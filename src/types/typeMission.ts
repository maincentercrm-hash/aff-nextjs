import type { ObjectId } from "mongodb";

export type TypeMission = {
  _id?: ObjectId;
  title: string;
  detail: string;
  point: number;
  thumbnail: string;
  start_date: string;
  end_date: string;
  type: string;
  condition: number;
  session: string;
  status: string;
  createDate: Date;
}
