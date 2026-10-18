export const DEMO_WORKER = {
  phone: '+923001111111',
  otp: '123456',
  name: 'Ahmed Khan',
  skill: 'painter',
  area: 'Liaquatabad',
  city: 'Karachi',
};

export const DEMO_HIRER = {
  phone: '+923002222222',
  otp: '123456',
  name: 'Sara Qureshi',
  area: 'Gulshan-e-Iqbal',
  city: 'Karachi',
};

export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

export const getAuthMode = (): 'otp' | 'pin' => {
  return (import.meta.env.VITE_AUTH_MODE as 'otp' | 'pin') || 'pin';
};
