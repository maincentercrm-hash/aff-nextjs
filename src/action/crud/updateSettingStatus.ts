import actionCreate from "./create";
import actionPoint from "./point";

const actionUpdateSettingStatus = async (table: string, data: any) => {
  try {
    // 1. อัพเดทสถานะก่อนเสมอ
    const response = await fetch("/api/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ table: table, data: data })
    });

    if (!response.ok) {
      throw new Error("Failed Update");
    }

    // 2. ถ้าสถานะเป็น approved เพิ่มเติมการจัดการ point
    if (data.status === 'approved') {
      // สร้างข้อมูลสำหรับอัพเดท point
      const clientPoint = {
        userId: data.userId,
        tel: data.tel,
        point: data.point,
        operation: '+'
      };

      // สร้าง log การเพิ่ม point
      const missionLog = {
        userId: data.userId,
        tel: data.tel,
        point: data.point,
        operation: '+',
        title: `ได้รับ Point จากการตั้งค่า ${data.title}`,
        createDate: new Date().toISOString()
      };

      await actionPoint('tbl_client_point', clientPoint);
      await actionCreate('tbl_mission_logs', missionLog);
    }

    return response.json();

  } catch (error) {
    console.error("Error Update:", error);
    throw error;
  }
};

export default actionUpdateSettingStatus;
