import { liff } from '@line/liff';

export const initLiff = async (liffId: string) => {
  try {
    await liff.init({ liffId });
    console.log('LIFF initialized successfully');
  } catch (error) {
    console.error('LIFF initialization failed', error);
  }
};
