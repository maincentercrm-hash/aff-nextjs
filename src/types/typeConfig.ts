// types/config.ts

// Types สำหรับ Icon Menu
export interface MenuIcon {
  online_marketing: {
    icon: string;
  };
  community: {
    icon: string;
  };
  mission: {
    icon: string;
  };
  report: {
    icon: string;
  };
  setting: {
    icon: string;
  };
  support: {
    icon: string;
  };
  point: {
    icon: string;
  };
}

// Types สำหรับ Dashboard
export interface Dashboard {
  section_cover: {
    bg_image: string;
    text_color: string;
  };
  section_url: {
    bg: string;
    button_color: string;
    button_text_color: string;
  };
}

// Types สำหรับ Slider
export interface SliderItem {
  image: string;
  url: string;
  id?: string;
}

export type SliderConfig = Record<string, SliderItem>;

// Types สำหรับหน้าต่างๆ
export interface OnlineMarketing {
  bg_image: string;
  icon_image: string;
  text_color: string;
  pagination_color: string;
}

export interface Community {
  bg_image: string;
  icon_image: string;
  button_save_color: string;
  button_link_color: string;
  pagination_color: string;
}

export interface Mission {
  button_get_mission_color: string;
  button_has_mission_color: string;
  button_condition_mission_color: string;
  button_get_reward_color: string;
  pagination_color: string;
}

export interface Setting {
  bg_image: string;
}

export interface Support {
  bg_image: string;
  button_link_color: string;
  pagination_color: string;
}

export interface Point {
  bg_image: string;
  section_point: {
    bg_color: string;
    text_color: string;
  };
  icon_image: string;
  text_color: string;
  pagination_color: string;
}

// Base Config Type
export interface Config {
  menu_icon: MenuIcon;
  dashboard: Dashboard;
  slider: SliderConfig;  // เปลี่ยนจาก SliderItem[] เป็น SliderConfig
  online_marketing: OnlineMarketing;
  community: Community;
  mission: Mission;
  setting: Setting;
  support: Support;
  point: Point;
}

// API Response Types
export interface ConfigResponse {
  success: boolean;
  data: Config;
  message?: string;
  error?: string;
}

export interface UpdateConfigResponse {
  success: boolean;
  message: string;
  error?: string;
}

// API Request Types
export interface UpdateConfigRequest {
  config: Partial<Config>;
}

// Utility Types
export type ConfigPath = keyof Config;
export type ConfigSection<T extends ConfigPath> = Config[T];
export type ConfigSectionKey<T extends ConfigPath> = keyof ConfigSection<T>;

export type UpdateConfigSection<T extends ConfigPath> = {
  path: T;
  data: Partial<ConfigSection<T>>;
};

export type PartialConfig = {
  [K in ConfigPath]?: Partial<Config[K]>;
};

// Constants
export const CONFIG_PATHS = [
  'menu_icon',
  'dashboard',
  'slider',
  'online_marketing',
  'community',
  'mission',
  'setting',
  'support',
  'point'
] as const;

// Type Guards
export const isConfigPath = (path: string): path is ConfigPath => {
  return CONFIG_PATHS.includes(path as ConfigPath);
};

export const isValidConfigData = <T extends ConfigPath>(
  path: T,
  data: unknown
): data is Partial<ConfigSection<T>> => {
  if (!data || typeof data !== 'object') return false;

  // ตรวจสอบเพิ่มเติมตามความต้องการ
  return true;
};

// Utility Types สำหรับ form handling (ถ้าต้องการใช้)
export type ConfigFormData = {
  [K in ConfigPath]: {
    [P in keyof Config[K]]: string;
  };
};

// Error Types
export interface ConfigError {
  path: ConfigPath;
  message: string;
}
