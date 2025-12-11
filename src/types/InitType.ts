export type InitMarketing = {
  thumbnail?: Record<string, any>;
  title: string;
  excerpt: string;
  status: 'publish' | 'pending'
}

export type InitPoint = {
  thumbnail?: Record<string, any>;
  title: string;
  type: 'credit' | 'default';
  status: 'publish' | 'pending'
}

export type InitMission = {
  thumbnail?: Record<string, any>;
  title: string;
  type: 'single' | 'group',
  status: 'publish' | 'pending'
}
