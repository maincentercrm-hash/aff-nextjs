import type { ObjectId } from "mongodb";


export type TypeMedias = {
  _id?: ObjectId;
  type: string;
  bucket: string;
  generation: string;
  metageneration: string;
  fullPath: string;
  name: string;
  size: number;
  timeCreated: string;
  updated: string;
  md5Hash: string;
  contentDisposition: string;
  contentEncoding: string;
  contentType: string;
  url: string;
  createDate: string;
};
