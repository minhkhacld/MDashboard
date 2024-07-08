import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export const minimizeApp = async () => {
  if (Capacitor.getPlatform() === 'web') return;
  await App.minimizeApp();
};


export const getAppInfo = async () => {
  if (Capacitor.getPlatform() === 'web') return;
  await App.getInfo();
};

export const getDeviceId = async () => {
  const id = await Device.getId();
  return id.identifier;
}
