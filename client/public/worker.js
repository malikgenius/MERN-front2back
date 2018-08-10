console.log('Loaded service worker!');

self.addEventListener('push', ev => {
  const data = ev.data.json();
  console.log('Got push', data);
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'zeenahlogo.jpg'
    // tag: 'Push-notification from ZEENAHLIST'
  });
});
