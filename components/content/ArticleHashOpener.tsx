"use client";

import { useEffect } from "react";

function openSectionFromHash() {
  const rawId = window.location.hash.slice(1);
  if (!rawId) {
    return false;
  }

  let id = rawId;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    // Keep the raw fragment when a malformed percent escape is supplied.
  }

  if (!id) {
    return false;
  }

  const element = document.getElementById(id);
  if (!(element instanceof HTMLDetailsElement)) {
    return false;
  }

  element.open = true;
  requestAnimationFrame(() => element.scrollIntoView({ block: "start" }));
  return true;
}

export function ArticleHashOpener() {
  useEffect(() => {
    let retryTimer = 0;
    let attempts = 0;
    let stopped = false;

    const tryOpen = () => {
      if (stopped || openSectionFromHash()) {
        return;
      }

      // On a cold navigation, the server HTML and the client tree can become
      // available in separate frames. Keep the retry window short, but long
      // enough to cover that hydration boundary.
      if (attempts >= 20) {
        return;
      }
      attempts += 1;
      retryTimer = window.setTimeout(tryOpen, Math.min(100 + attempts * 50, 500));
    };

    const openAfterNavigation = () => {
      window.clearTimeout(retryTimer);
      attempts = 0;
      tryOpen();
    };

    const observer = new MutationObserver(() => {
      if (window.location.hash) {
        tryOpen();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    openAfterNavigation();
    window.addEventListener("hashchange", openAfterNavigation);
    window.addEventListener("popstate", openAfterNavigation);

    return () => {
      stopped = true;
      window.clearTimeout(retryTimer);
      observer.disconnect();
      window.removeEventListener("hashchange", openAfterNavigation);
      window.removeEventListener("popstate", openAfterNavigation);
    };
  }, []);

  return null;
}
