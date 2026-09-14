import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

const isNative = Capacitor.isNativePlatform();
const REMINDER_ID = 2300;

async function requestNotificationPermissions() {
  if (!isNative) return false;
  const current = await LocalNotifications.checkPermissions();
  if (current.display === 'granted') return true;
  const local = await LocalNotifications.requestPermissions();
  return local.display === 'granted';
}

async function scheduleDailyReminder() {
  if (!isNative) return;
  const ok = await requestNotificationPermissions();
  if (!ok) return;
  try { await LocalNotifications.createChannel({ id: 'kifnet-reminders', name: 'یادآوری‌های کیف‌نت', description: 'یادآوری ثبت دخل و خرج', importance: 4, sound: 'default', vibration: true }); } catch {}
  try { await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] }); } catch {}
  await LocalNotifications.schedule({
    notifications: [{
      id: REMINDER_ID,
      title: 'یادآوری کیف‌نت',
      body: 'امروز خرج‌ها و دخل‌های خود را ثبت کرده‌اید؟',
      schedule: { on: { hour: 23, minute: 0 }, repeats: true },
      sound: 'default',
      channelId: 'kifnet-reminders',
      extra: { type: 'daily-finance-reminder' }
    }]
  });
}


async function registerRemotePush() {
  if (!isNative || !window.KIFNET_NOTIFICATION_CONFIG?.enableRemotePush) return;
  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return;
    await PushNotifications.register();
  } catch (e) { console.warn('Push registration failed', e); }
}

PushNotifications.addListener('registration', async token => {
  const url = window.KIFNET_NOTIFICATION_CONFIG?.pushRegisterUrl;
  if (!url) return;
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token.value, platform: Capacitor.getPlatform(), appVersion: '10.0.0' }) });
  } catch (e) { console.warn('Push token registration failed', e); }
});

async function openExternal(url) {
  if (!url) return;
  if (isNative) { await Browser.open({ url }); return; }
  window.location.href = url;
}

window.KifNetNative = {
  isNative,
  openExternal,
  requestNotificationPermissions,
  scheduleDailyReminder,
  registerRemotePush
};

window.addEventListener('load', () => {
  scheduleDailyReminder().catch(() => {});
  registerRemotePush().catch(() => {});
});
