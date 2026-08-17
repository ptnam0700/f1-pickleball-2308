(function () {
  const EVENT_ISO = "2026-08-23T08:00:00+07:00";
  const target = new Date(EVENT_ISO).getTime();

  const els = {
    root: document.querySelector("[data-countdown]"),
    days: document.querySelector("[data-cd-days]"),
    hours: document.querySelector("[data-cd-hours]"),
    minutes: document.querySelector("[data-cd-minutes]"),
    seconds: document.querySelector("[data-cd-seconds]"),
    label: document.querySelector("[data-cd-label]"),
  };

  if (!els.root) return;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      els.root.classList.add("countdown--done");
      els.days.textContent = "00";
      els.hours.textContent = "00";
      els.minutes.textContent = "00";
      els.seconds.textContent = "00";
      if (els.label) els.label.textContent = "Giải đấu đang diễn ra!";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    els.days.textContent = pad(days);
    els.hours.textContent = pad(hours);
    els.minutes.textContent = pad(minutes);
    els.seconds.textContent = pad(seconds);

    requestAnimationFrame(() => setTimeout(tick, 1000));
  }

  tick();
})();
