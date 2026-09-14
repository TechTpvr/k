# کیف‌نت v8

نسخه ۸ کیف‌نت با لایه آماده انتشار برای Android و iOS، اعلان محلی، Push و بروزرسانی اجباری.

## امکانات v8
- لوگوی رسمی برنامه در `logo-app.png` و manifest.
- پروژه آماده Capacitor برای Android و iOS.
- یادآوری روزانه ساعت ۲۳:۰۰ برای ثبت دخل و خرج با Local Notifications در نسخه native.
- زیرساخت Push Notification برای اعلان‌های راه دور مثل اطلاعیه و تبلیغات؛ برای ارسال واقعی باید API سرور و FCM/APNs متصل شود.
- سیستم بروزرسانی اجباری با `update.json`. وقتی `versionCode` جدیدتر شود یا `minimumVersionCode` از نسخه نصب‌شده بالاتر باشد، برنامه قفل می‌شود تا بروزرسانی انجام شود.
- اطلاعات مالی همچنان با همان کلید `kifnet_v2` در localStorage نگهداری می‌شوند تا با آپدیت برنامه حذف نشوند.
- Service Worker به v8 ارتقا یافته و `update.json` همیشه با `no-store` بررسی می‌شود.

## نکته مهم درباره حفظ اطلاعات
آپدیت معمولی Android/iOS داده‌های WebView را پاک نمی‌کند. حذف کامل برنامه، پاک‌سازی داده برنامه یا نصب مجدد می‌تواند localStorage را از بین ببرد؛ برای همین پشتیبان JSON موجود در تنظیمات همچنان توصیه می‌شود.

## انتشار Android و iOS با GitHub
1. کل محتوای این ZIP را داخل repository گیت‌هاب قرار دهید.
2. GitHub Actions فایل‌های workflow را اجرا می‌کند.
3. Android برای خروجی release به keystore نیاز دارد. keystore و رمزها را فقط در GitHub Secrets قرار دهید.
4. iOS به حساب Apple Developer و certificate/provisioning profile نیاز دارد و برای TestFlight باید secrets مربوط به App Store Connect تنظیم شود.
5. نسخه بعدی: در `package.json` نسخه را مثلاً به `8.1.0` ببرید و `update.json` را با `versionCode` جدید منتشر کنید. اگر `minimumVersionCode` را بالا ببرید، نسخه‌های قدیمی قفل می‌شوند.

## Push واقعی
در `notification-config.js` مقدار `enableRemotePush` و `pushRegisterUrl` را تنظیم کنید. سرور باید token دستگاه را ذخیره کند و از FCM برای Android و APNs برای iOS استفاده کند. کلیدهای سرویس هرگز داخل repository قرار نگیرند.
