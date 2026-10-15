/* global Audio, URL, console, document, process, window */

import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { chromium } from "playwright";

// Run against a development or published article. TTS is intercepted only in
// these isolated browser contexts: no live service or editorial data is changed.
const origin = (process.argv[2] ?? "http://localhost:4173").replace(/\/$/, "");
const articlePath = process.argv[3] ?? "/articles/does-god-exist";
const browser = await chromium.launch({ headless: true });
const results = [];

// A valid, quiet PCM fixture exercises the real HTMLAudioElement decoder.
const samples = 8_000 * 20;
const wave = Buffer.alloc(44 + samples * 2);
wave.write("RIFF", 0);
wave.writeUInt32LE(wave.length - 8, 4);
wave.write("WAVEfmt ", 8);
wave.writeUInt32LE(16, 16);
wave.writeUInt16LE(1, 20);
wave.writeUInt16LE(1, 22);
wave.writeUInt32LE(8_000, 24);
wave.writeUInt32LE(16_000, 28);
wave.writeUInt16LE(2, 32);
wave.writeUInt16LE(16, 34);
wave.write("data", 36);
wave.writeUInt32LE(samples * 2, 40);

const success = (route) => route.fulfill({ status: 200, contentType: "audio/wav", body: wave });
const failed = (route, status = 502, headers = {}) =>
  route.fulfill({ status, headers, contentType: "application/json", body: '{"error":"Temporarily unavailable"}' });

async function scenario(name, viewport, handler, check) {
  const context = await browser.newContext({ viewport, serviceWorkers: "block" });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.addInitScript(() => {
      window.__neuralQa = { speechCalls: 0, aborted: 0 };
      const BaseAudio = Audio;
      window.Audio = function (...args) {
        const audio = new BaseAudio(...args);
        window.__neuralQa.audio = audio;
        return audio;
      };
      window.Audio.prototype = BaseAudio.prototype;
      if (window.speechSynthesis) {
        window.speechSynthesis.speak = () => { window.__neuralQa.speechCalls += 1; };
      }
      const nativeFetch = window.fetch;
      window.fetch = (input, options) => {
        if (String(input).includes("/api/tts?")) {
          options?.signal?.addEventListener("abort", () => { window.__neuralQa.aborted += 1; });
        }
        return nativeFetch(input, options);
      };
    });
    await page.route("**/api/tts?**", async (route) => {
      const url = new URL(route.request().url());
      requests.push({ at: Date.now(), text: url.searchParams.get("text"), voice: url.searchParams.get("voice") });
      await handler(route, requests);
    });
    await page.goto(`${origin}${articlePath}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const read = page.getByRole("button", { name: /^Read article aloud:/ }).first();
    await read.waitFor({ timeout: 60_000 });
    await page.waitForFunction(() => {
      const button = document.querySelector('button[aria-label^="Read article aloud:"]');
      return button && Object.keys(button).some((key) => key.startsWith("__reactProps$") && typeof button[key]?.onClick === "function");
    }, undefined, { timeout: 60_000 });
    const consent = page.getByRole("button", { name: "No thanks", exact: true });
    if (await consent.isVisible()) await consent.click();
    await read.click();
    await check(page, requests);
    const state = await page.evaluate(() => ({
      speechCalls: window.__neuralQa.speechCalls,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    assert.equal(state.speechCalls, 0, "Device speech must never be invoked");
    assert.equal(state.horizontalOverflow, false);
    assert.deepEqual(errors, []);
    assert.ok(requests.every((request) => request.voice === "en-US-GuyNeural"));
    results.push({ name, viewport, requests: requests.length, ...state, passed: true });
    console.log(`PASS ${name} (${viewport.width}px)`);
  } finally {
    await context.close();
  }
}

const desktop = { width: 1280, height: 900 };
const phone = { width: 390, height: 844 };
const preparing = (page) => page.getByRole("button", { name: "Cancel audio preparation", exact: true });
const playing = (page) => page.getByRole("button", { name: "Pause reading", exact: true });
const waitForRequests = async (requests, count) => {
  for (let attempt = 0; requests.length < count && attempt < 400; attempt += 1) {
    await new Promise((resolve) => globalThis.setTimeout(resolve, 100));
  }
  assert.ok(requests.length >= count, `Expected ${count} neural requests`);
};

try {
  await Promise.all([
    scenario("repeated failures keep waiting then recover", desktop,
      (route, requests) => requests.length <= 3 ? failed(route) : success(route),
      async (page, requests) => {
        await waitForRequests(requests, 3);
        assert.ok(await preparing(page).isVisible());
        await playing(page).waitFor({ timeout: 30_000 });
        assert.ok(requests[1].at - requests[0].at >= 2_900);
        assert.ok(requests[2].at - requests[1].at >= 5_900);
        await page.getByRole("button", { name: "Stop reading", exact: true }).click();
      }),
    scenario("429 Retry-After honored", phone,
      (route, requests) => requests.length === 1 ? failed(route, 429, { "Retry-After": "7" }) : success(route),
      async (page, requests) => {
        await playing(page).waitFor({ timeout: 20_000 });
        assert.ok(requests[1].at - requests[0].at >= 6_900);
        await page.getByRole("button", { name: "Stop reading", exact: true }).click();
      }),
    scenario("503 HTTP-date Retry-After honored", desktop,
      (route, requests) => requests.length === 1
        ? failed(route, 503, { "Retry-After": new Date(Date.now() + 8_000).toUTCString() }) : success(route),
      async (page, requests) => {
        await playing(page).waitFor({ timeout: 20_000 });
        assert.ok(requests[1].at - requests[0].at >= 6_900);
        await page.getByRole("button", { name: "Stop reading", exact: true }).click();
      }),
    scenario("network failure retries without device speech", desktop,
      (route, requests) => requests.length === 1 ? route.abort("internetdisconnected") : success(route),
      async (page) => {
        await preparing(page).waitFor();
        await playing(page).waitFor({ timeout: 15_000 });
        await page.getByRole("button", { name: "Stop reading", exact: true }).click();
      }),
    scenario("invalid audio retries the neural request", phone,
      (route, requests) => requests.length === 1
        ? route.fulfill({ status: 200, contentType: "audio/mpeg", body: "broken-media" }) : success(route),
      async (page) => {
        await playing(page).waitFor({ timeout: 15_000 });
        await page.getByRole("button", { name: "Stop reading", exact: true }).click();
      }),
    scenario("empty successful response retries", desktop,
      (route, requests) => requests.length === 1
        ? route.fulfill({ status: 200, contentType: "audio/mpeg", body: "" }) : success(route),
      async (page) => {
        await playing(page).waitFor({ timeout: 15_000 });
        await page.getByRole("button", { name: "Stop reading", exact: true }).click();
      }),
    scenario("media failure after playback starts recovers position", phone,
      (route) => success(route),
      async (page) => {
        await playing(page).waitFor();
        await page.evaluate(() => {
          const audio = window.__neuralQa.audio;
          audio.currentTime = 5;
          audio.dispatchEvent(new window.Event("timeupdate"));
          audio.dispatchEvent(new window.Event("error"));
        });
        await preparing(page).waitFor();
        await playing(page).waitFor({ timeout: 15_000 });
        assert.ok(await page.evaluate(() => window.__neuralQa.audio.currentTime >= 4.9));
        await page.getByRole("button", { name: "Stop reading", exact: true }).click();
      }),
    scenario("cancel stops the retry delay", phone,
      (route) => failed(route),
      async (page, requests) => {
        await waitForRequests(requests, 1);
        const cancel = preparing(page);
        await cancel.focus();
        await page.keyboard.press("Enter");
        await cancel.waitFor({ state: "hidden" });
        const count = requests.length;
        await page.waitForTimeout(4_000);
        assert.equal(requests.length, count);
        assert.equal(await page.getByRole("group", { name: /^Audio controls for/ }).count(), 0);
      }),
    scenario("later paragraph failure waits and can be cancelled", desktop,
      (route, requests) => requests.length === 1 ? success(route) : failed(route),
      async (page, requests) => {
        await playing(page).waitFor();
        await page.evaluate(() => {
          window.__neuralQa.audio.pause();
          window.__neuralQa.audio.dispatchEvent(new window.Event("ended"));
        });
        await waitForRequests(requests, 2);
        await preparing(page).waitFor();
        await preparing(page).click();
        const count = requests.length;
        await page.waitForTimeout(4_000);
        assert.equal(requests.length, count);
      }),
    (async () => {
      let release;
      const held = new Promise((resolve) => { release = resolve; });
      await scenario("seek cancels pending request; controls remain functional", phone,
        async (route, requests) => {
          if (requests.length === 1) await held;
          await success(route).catch(() => {}); // The obsolete request may already be aborted.
        },
        async (page, requests) => {
          await waitForRequests(requests, 1);
          assert.ok(await preparing(page).isVisible());
          await page.getByRole("button", { name: "Next paragraph", exact: true }).click();
          await playing(page).waitFor({ timeout: 15_000 });
          release();
          assert.ok(await page.evaluate(() => window.__neuralQa.aborted > 0));
          assert.notEqual(requests[0].text, requests[1].text);
          await playing(page).click();
          await page.getByRole("button", { name: "Resume reading", exact: true }).click();
          await playing(page).waitFor();
          await page.getByRole("button", { name: "Playback speed 1 times. Press to increase speed.", exact: true }).click();
          assert.ok(await page.getByRole("button", { name: "Playback speed 1.25 times. Press to increase speed.", exact: true }).isVisible());
          await page.getByRole("button", { name: "Stop reading", exact: true }).click();
        });
    })(),
    (async () => {
      let release;
      const held = new Promise((resolve) => { release = resolve; });
      await scenario("cancel aborts a slow loading request", desktop,
        async (route) => { await held; await success(route).catch(() => {}); },
        async (page, requests) => {
          await waitForRequests(requests, 1);
          await preparing(page).click();
          release();
          assert.ok(await page.evaluate(() => window.__neuralQa.aborted > 0));
          await page.waitForTimeout(4_000);
          assert.equal(requests.length, 1);
          assert.equal(await playing(page).count(), 0);
        });
    })(),
  ]);
  console.log(JSON.stringify({ origin, articlePath, results }, null, 2));
} finally {
  await browser.close();
}
