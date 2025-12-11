// app/api/configs/init/route.ts
import { NextResponse } from 'next/server';

import { connectDB } from '@/configs/mongodb';

const defaultConfig = {
  menu_icon: {
    online_marketing: {
      icon: ''
    },
    community: {
      icon: ''
    },
    mission: {
      icon: ''
    },
    report: {
      icon: ''
    },
    setting: {
      icon: ''
    },
    support: {
      icon: ''
    },
    point: {
      icon: ''
    }
  },
  dashboard: {
    section_cover: {
      bg_image: '',
      text_color: '#000000'
    },
    section_url: {
      bg: '#FFFFFF',
      button_color: '#1976D2',
      button_text_color: '#FFFFFF'
    }
  },
  slider: [],
  online_marketing: {
    bg_image: '',
    icon_image: '',
    text_color: '#000000',
    pagination_color: '#1976D2'
  },
  community: {
    bg_image: '',
    icon_image: '',
    button_save_color: '#4CAF50',
    button_link_color: '#1976D2',
    pagination_color: '#1976D2'
  },
  mission: {
    button_get_mission_color: '#4CAF50',
    button_has_mission_color: '#FFC107',
    button_condition_mission_color: '#FF5722',
    button_get_reward_color: '#2196F3',
    pagination_color: '#1976D2'
  },
  setting: {
    bg_image: ''
  },
  support: {
    bg_image: '',
    button_link_color: '#1976D2',
    pagination_color: '#1976D2'
  },
  point: {
    bg_image: '',
    section_point: {
      bg_color: '#F5F5F5',
      text_color: '#000000'
    },
    icon_image: '',
    text_color: '#000000',
    pagination_color: '#1976D2'
  }
};

export async function GET() {
  try {
    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection('tbl_configs');

    // เช็คว่ามี config อยู่แล้วหรือไม่
    const existingConfig = await collection.findOne({});

    if (!existingConfig) {
      // ถ้าไม่มี config เลย ให้สร้างใหม่ทั้งหมด
      await collection.insertOne(defaultConfig);
    } else {
      // ถ้ามี config แล้ว ให้ merge กับ defaultConfig
      const mergedConfig = deepMerge(defaultConfig, existingConfig);

      // อัพเดท config ด้วยข้อมูลที่ merge แล้ว
      await collection.updateOne(
        { _id: existingConfig._id },
        { $set: mergedConfig },
        { upsert: true }
      );
    }

    await client.close();

    return NextResponse.json({
      success: true,
      message: 'Configuration initialized'
    });
  } catch (error) {
    console.error('Error initializing config:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to initialize configuration'
    }, { status: 500 });
  }
}

// ฟังก์ชัน deepMerge สำหรับ merge object
function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }


  return output;
}

// ฟังก์ชันตรวจสอบว่าเป็น object หรือไม่
function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
