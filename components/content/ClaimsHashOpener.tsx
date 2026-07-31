"use client";

import { useEffect } from "react";

function openClaimFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;

  const element = document.getElementById(id);
  if (!(element instanceof HTMLDetailsElement)) return;

  element.open = true;
  requestAnimationFrame(() => element.scrollIntoView({ block: "start" }));
}

export function ClaimsHashOpener() {
  useEffect(() => {
    openClaimFromHash();
    window.addEventListener("hashchange", openClaimFromHash);
    return () => window.removeEventListener("hashchange", openClaimFromHash);
  }, []);

  return null;
}
