importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCdIPv5M0mUooxPbM5v5YiCARI2EIlPb7E",
  authDomain: "tairra-7f828.firebaseapp.com",
  databaseURL: "https://tairra-7f828-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tairra-7f828",
  storageBucket: "tairra-7f828.firebasestorage.app",
  messagingSenderId: "841623012349",
  appId: "1:841623012349:web:b4842a30dcc9ac26f5cf94",
  measurementId: "G-BL6WJX9K11"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'notification-1',
    data: payload.data
  };

  return self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});

self.addEventListener('notificationclick', (event) => {
  // console.log('[firebase-messaging-sw.js] Notification click: ', event);
  event.notification.close();

  // Add custom click handling here if needed
  const urlToOpen = new URL('/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((windowClients) => {
      // If a Window tab matching the targeted URL already exists, focus that;
      const hadWindowToFocus = windowClients.some((windowClient) => {
        return windowClient.url === urlToOpen ? (windowClient.focus(), true) : false;
      });
      // Otherwise, open a new tab to the applicable URL and focus it.
      if (!hadWindowToFocus) {
        return clients.openWindow(urlToOpen).then((windowClient) => windowClient?.focus());
      }
    })
  );
});
