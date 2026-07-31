"use client";

import { useEffect } from "react";

function openClaimFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return false;

  const element = document.getElementById(id);
  if (!element || element.tagName !== "DETAILS") return false;

  element.setAttribute("open", "");
  requestAnimationFrame(() => element.scrollIntoView({ block: "start" }));
  return true;
}

export function ClaimsHashOpener() {
  useEffect(() => {
    let retryFrame = 0;
    let retryTimer = 0;

    const openAfterNavigation = () => {
      window.cancelAnimationFrame(retryFrame);
      window.clearTimeout(retryTimer);

      if (openClaimFromHash()) return;

      retryFrame = window.requestAnimationFrame(() => {
        retryTimer = window.setTimeout(openClaimFromHash, 100);
      });
    };

    openAfterNavigation();
    window.addEventListener("hashchange", openAfterNavigation);
    window.addEventListener("popstate", openAfterNavigation);

    return () => {
      window.cancelAnimationFrame(retryFrame);
      window.clearTimeout(retryTimer);
      window.removeEventListener("hashchange", openAfterNavigation);
      window.removeEventListener("popstate", openAfterNavigation);
    };
  }, []);

  return null;
}
