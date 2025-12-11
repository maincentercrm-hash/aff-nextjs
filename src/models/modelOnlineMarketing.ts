import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';


export interface IOnlineMarketing extends Document {
  title: string;
  excerpt: string;
  detail: string;
  thumbnail: string;
  status: string;
  createDate: Date;
}

const onlineMarketingSchema: Schema = new Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  detail: { type: String, default: '' },
  thumbnail: { type: String },
  status: { type: String, default: 'publish' },
  createDate: { type: Date, default: Date.now },
});

const ModelOnlineMarketing: Model<IOnlineMarketing> = mongoose.models.tbl_online_marketing || mongoose.model<IOnlineMarketing>('tbl_online_marketing', onlineMarketingSchema);

export default ModelOnlineMarketing;
