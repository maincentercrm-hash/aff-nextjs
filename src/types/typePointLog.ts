export type TypePointLog = {
  _id: string;
  userId: string;
  tel: string;
  point: string;
  operation: string;
  title: string;
  type?: 'default' | 'credit';
  status?: 'pending' | 'complete' | 'rejected';
  callback_time?: string;
  createDate: string;
}
