// حدث التثبيت: يخبر المتصفح بأن يتجاوز مرحلة الانتظار ويبدأ العمل فوراً
// Install event: Tells the browser to skip waiting and activate immediately
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// حدث التفعيل: يقوم بإلغاء تسجيل ملف الخدمة الحالي (هذا الكود مستخدم لإيقاف Service Worker قديم)
// Activate event: Unregisters the existing service worker (used here to deactivate an old SW)
self.addEventListener('activate', function(e) {
  self.registration.unregister()
    .then(function() {
      // جلب جميع النوافذ المفتوحة
      return self.clients.matchAll();
    })
    .then(function(clients) {
      // تحديث الصفحة في جميع النوافذ لضمان عملها بدون الخدمة القديمة
      clients.forEach(client => client.navigate(client.url));
    });
});
