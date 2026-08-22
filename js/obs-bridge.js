/*
  OBS bridge — one-way score push from referee.html to overlay.html.

  Both pages are loaded by OBS's own Chromium (CEF): referee.html in a Custom
  Browser Dock, overlay.html in a Browser Source. Those two contexts live in the
  same CEF profile and share an origin, so they also share localStorage and can
  talk over a BroadcastChannel. No server, no relay, no account.

  We write both channels on every push:
  - BroadcastChannel: instant, but not available in every CEF build.
  - localStorage: fires a `storage` event in other same-origin contexts, and
    doubles as the snapshot a Browser Source reads when it starts or refreshes
    mid-match.
*/
(function (global) {
  const KEY = 'fi-obs-scoreboard';
  const CHANNEL = 'fi-obs-scoreboard';

  let channel = null;
  try {
    channel = new BroadcastChannel(CHANNEL);
  } catch (err) {
    channel = null; // older CEF — localStorage `storage` events carry it instead
  }

  function publish(payload) {
    const data = Object.assign({ ts: Date.now() }, payload);
    const json = JSON.stringify(data);
    try {
      localStorage.setItem(KEY, json);
    } catch (err) {
      /* private mode / quota — BroadcastChannel still delivers to a live overlay */
    }
    if (channel) channel.postMessage(data);
  }

  // Latest snapshot, or null if the referee page has not pushed anything yet.
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  // fn is called with the snapshot on subscribe (if one exists) and on every push.
  function subscribe(fn) {
    const initial = read();
    if (initial) fn(initial);

    if (channel) channel.addEventListener('message', (e) => fn(e.data));

    global.addEventListener('storage', (e) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        fn(JSON.parse(e.newValue));
      } catch (err) {
        /* ignore a torn write */
      }
    });
  }

  global.OBSBridge = { publish, subscribe, read, KEY };
})(window);
