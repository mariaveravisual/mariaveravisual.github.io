/* Active reading time for Maria Vera's portfolio.
 * Reports visible, focused and non-idle seconds to Umami custom events.
 * Umami's built-in Visit Duration metric remains unchanged.
 */
(function () {
  "use strict";
  if (window.portfolioReadingTime) return;

  var IDLE_MS = 4 * 60 * 1000;
  var CHECKPOINT_MS = 30 * 1000;
  var MAX_SAMPLE_MS = 60 * 1000;
  var MIN_REPORT_SECONDS = 3;
  var milestones = [
    { seconds: 30, name: "reading_30s" },
    { seconds: 60, name: "reading_1min" },
    { seconds: 180, name: "reading_3min" },
    { seconds: 300, name: "reading_5min" }
  ];

  var page = "";
  var title = "";
  var pendingMs = 0;
  var totalMs = 0;
  var lastTick = Date.now();
  var lastActivity = lastTick;
  var visible = document.visibilityState !== "hidden";
  var focused = document.hasFocus();
  var sentMilestones = Object.create(null);

  function pagePath(value) {
    var path = String(value || window.location.pathname);
    return path.split(/[?#]/)[0] || "/";
  }

  function track(name, data) {
    if (!window.umami || typeof window.umami.track !== "function") return false;
    try {
      // Attribute a duration to its original page, even after SPA navigation.
      window.umami.track(function (props) {
        return Object.assign({}, props, {
          name: name,
          url: page,
          title: title,
          data: data
        });
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  function reportMilestones() {
    var seconds = Math.floor(totalMs / 1000);
    milestones.forEach(function (milestone) {
      if (seconds >= milestone.seconds && !sentMilestones[milestone.name]) {
        if (track(milestone.name, { page: page, seconds: milestone.seconds })) {
          sentMilestones[milestone.name] = true;
        }
      }
    });
  }

  function sample() {
    var current = Date.now();
    if (page && visible && focused && current > lastTick) {
      var activeUntil = Math.min(current, lastActivity + IDLE_MS);
      var elapsed = Math.max(0, activeUntil - lastTick);
      // Do not count a long period where a browser might have been suspended.
      var activeMs = Math.min(elapsed, MAX_SAMPLE_MS);
      pendingMs += activeMs;
      totalMs += activeMs;
    }
    lastTick = current;
    if (page) reportMilestones();
  }

  function flush(reason) {
    if (!page) return;
    var seconds = Math.floor(pendingMs / 1000);
    if (seconds < MIN_REPORT_SECONDS) return;
    if (track("reading_time", { page: page, seconds: seconds, reason: reason })) {
      pendingMs -= seconds * 1000;
    }
  }

  function setPage(url, nextTitle) {
    var path = pagePath(url);
    if (page === path) {
      if (nextTitle) title = String(nextTitle);
      return;
    }
    sample();
    flush("navigation");
    page = path;
    title = String(nextTitle || document.title);
    pendingMs = 0;
    totalMs = 0;
    sentMilestones = Object.create(null);
    lastTick = Date.now();
    lastActivity = lastTick;
  }

  function activity() {
    var current = Date.now();
    if (current - lastActivity >= IDLE_MS) sample();
    lastActivity = current;
  }

  ["scroll", "pointermove", "pointerdown", "keydown", "touchstart"].forEach(function (name) {
    window.addEventListener(name, activity, { passive: true });
  });

  document.addEventListener("visibilitychange", function () {
    sample();
    visible = document.visibilityState !== "hidden";
    if (!visible) flush("hidden");
    else {
      lastTick = Date.now();
      lastActivity = lastTick;
    }
  });

  window.addEventListener("blur", function () {
    sample();
    focused = false;
    flush("blur");
  });

  window.addEventListener("focus", function () {
    sample();
    focused = true;
    lastTick = Date.now();
    lastActivity = lastTick;
  });

  window.addEventListener("pagehide", function () {
    sample();
    flush("pagehide");
  });

  window.setInterval(function () {
    sample();
    flush("checkpoint");
  }, CHECKPOINT_MS);

  window.portfolioReadingTime = { setPage: setPage };

  function start() {
    if (!page) {
      var path = window.location.pathname;
      // Visual Work is a virtual route within the home document.
      if (window.location.hash === "#visual-work" || window.location.hash === "#visual-projects") {
        path = (path.indexOf("/es/") === 0 ? "/es" : "") + "/visual-work";
      }
      setPage(path, document.title);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();