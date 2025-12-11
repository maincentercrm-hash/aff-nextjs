// types/InitType.ts
export type InitSetting = {
  title: string;
  point: number;
  status: boolean;  // เพิ่ม status
}

// types/typeSetting.ts
export type TypeSetting = {
  _id: string;
  title: string;
  point: number;
  createDate: string;
  status: boolean; // เพิ่ม field status สำหรับ switch
}


// types/typeSettingLog.ts
export type TypeSettingLog = {
  _id: string;
  userId: string;  // LINE userId
  tel: string;
  settingId: string;  // อ้างอิงไปยัง _id ของ TypeSetting
  title: string;
  url: string;
  point: number;
  status: 'pending' | 'approved' | 'rejected';  // สถานะการตรวจสอบ
  createDate: string;  // วันที่ส่ง URL
  settingTitle: string;  // New field from the lookup
}

// types/InitType.ts
// เพิ่ม type สำหรับการอัพเดทสถานะ
export type InitSettingLogUpdate = {
  userId: string;  // LINE userId
  settingId: string;  // อ้างอิงไปยัง _id ของ TypeSetting
  title: string;
  url: string;
  point: number;
  status: 'approved' | 'rejected';  // สถานะการตรวจสอบ
  createDate: string;  // วันที่ส่ง URL
}
