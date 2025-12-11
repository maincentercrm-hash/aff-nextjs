import type { ObjectId } from "mongodb";

export type TypeMarketing = {
  _id?: ObjectId;
  title: string;
  excerpt: string;
  detail: string;
  thumbnail: string;
  file_download?: string;
  status: string;
  createDate: Date;
}
