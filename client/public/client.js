// Hard-coded, replace with your public key
const publicVapidKey =
  'BKhHjKyRZL8xqvd0gtjzJoE0Ih0EFDT1VHvGpj6706qCBw9sbkavnMfNwqMd8S_rpr2Oz8W0EmgM6Jj9dXdxne4';

if ('serviceWorker' in navigator) {
  console.log('Registering service worker');
  run().catch(error => console.error(error));
}

async function run() {
  console.log('Registering service worker');
  const registration = await navigator.serviceWorker.register('/worker.js', {
    scope: '/'
  });
  console.log('Registered service worker');

  console.log('Registering push');
  //When using your VAPID key in your web app, you'll need to convert the URL safe base64 string to a Uint8Array to pass into the subscribe call, which you can do like so:
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    // The `urlBase64ToUint8Array()` function is the same as in
    // https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  console.log('Registered push');

  console.log('Sending push');
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'content-type': 'application/json'
    }
  });
  console.log('Sent push');
}
