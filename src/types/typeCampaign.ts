import type { ObjectId } from "mongodb";

export type TypeCampaign = {
  _id?: ObjectId;
  thumbnail: string;
  target: string;
  title: string;
  detail: string;
  volumn: number;
  click: number;
  active: number;
}
