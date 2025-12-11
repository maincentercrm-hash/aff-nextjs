import type { ObjectId } from "mongodb";

export type TypeClient = {
  _id?: ObjectId;
  userId: string;
  tel: string;
  point?: number;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
  updateDate: string;
  createDate: Date;

}
