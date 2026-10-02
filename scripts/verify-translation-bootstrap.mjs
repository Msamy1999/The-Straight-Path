import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { log } from "node:console";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";
import vm from "node:vm";
import ts from "typescript";

// This is a policy and loader-failure regression, not a mocked Arabic success
// test. Real translated prose and scripture preservation are checked in CUA.
const baseline = process.argv.includes("--baseline");
const readSource = (path) => baseline
  ? execFileSync("git", ["show", `HEAD:${path}`], { encoding: "utf8" })
  : readFileSync(path, "utf8");

const policySource = readSource("next.config.ts");
const translationSource = readSource("lib/translation.ts");
const policyAst = ts.createSourceFile("next.config.ts", policySource, ts.ScriptTarget.Latest, true);

function arrayStrings(name) {
  const result = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(policyAst) === name && node.initializer) {
      const initializer = node.initializer;
      const array = ts.isArrayLiteralExpression(initializer) ? initializer :
        ts.isCallExpression(initializer) && ts.isPropertyAccessExpression(initializer.expression) &&
        ts.isArrayLiteralExpression(initializer.expression.expression) ? initializer.expression.expression : null;
      for (const item of array?.elements ?? []) {
        if (ts.isStringLiteral(item)) result.push(item.text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(policyAst);
  return result;
}

const requiredOrigin = "https://translate-pa.googleapis.com";
const scriptSources = arrayStrings("scriptSources");
const policyDirectives = arrayStrings("contentSecurityPolicy");
const connectSources = policyDirectives.find((line) => line.startsWith("connect-src "))?.split(" ") ?? [];
const policyAllowsLanguageBootstrap = scriptSources.includes(requiredOrigin) && connectSources.includes(requiredOrigin);

async function loaderFailureCase() {
  const headNodes = [];
  const bodyNodes = [];
  const createdScripts = [];
  const timers = new Set();
  const makeParent = (nodes) => ({
    appendChild(node) { node.parentNode = this; nodes.push(node); return node; },
    removeChild(node) { const index = nodes.indexOf(node); if (index >= 0) nodes.splice(index, 1); node.parentNode = null; return node; },
  });
  const head = makeParent(headNodes);
  const body = makeParent(bodyNodes);
  const document = {
    head,
    body,
    getElementById(id) { return [...headNodes, ...bodyNodes].find((node) => node.id === id) ?? null; },
    querySelector(selector) {
      if (selector.startsWith("script[src=")) return headNodes.find((node) => node.tagName === "SCRIPT") ?? null;
      if (selector.startsWith('link[rel="preconnect"]')) return headNodes.find((node) => node.tagName === "LINK" && selector.includes(node.href)) ?? null;
      return null;
    },
    createElement(tag) {
      const node = {
        tagName: tag.toUpperCase(),
        parentNode: null,
        setAttribute(name, value) { this[name] = value; },
        remove() { this.parentNode?.removeChild(this); },
      };
      if (tag === "script") createdScripts.push(node);
      return node;
    },
  };
  const window = {
    setTimeout(callback, ms) { const timer = setTimeout(callback, ms); timers.add(timer); return timer; },
    clearTimeout(timer) { clearTimeout(timer); timers.delete(timer); },
  };
  const compiled = ts.transpileModule(translationSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const sandbox = { exports: {}, window, document };
  vm.runInNewContext(compiled, sandbox, { filename: "translation-loader-regression.js" });
  try {
    sandbox.exports.warmUpTranslation();
    assert.equal(createdScripts.length, 1, "first intent should inject the loader once");
    const first = createdScripts[0];
    first.onerror();
    await Promise.resolve();
    await Promise.resolve();
    const failedScriptRemoved = !headNodes.includes(first);
    sandbox.exports.warmUpTranslation();
    const injectedScripts = createdScripts.length;
    const second = createdScripts[1];
    if (second) second.onerror();
    await Promise.resolve();
    await Promise.resolve();
    return { failedScriptRemoved, injectedScripts };
  } finally {
    for (const timer of timers) clearTimeout(timer);
  }
}

const retry = await loaderFailureCase();

async function expiredRunCannotOverwriteSourceReset() {
  const scripts = [];
  const timers = [];
  const preferences = new Map();
  let reloads = 0;
  const location = { href: "http://localhost:4173/articles/the-final-message?review=1#introduction", reload() { reloads += 1; } };
  const document = {
    cookie: "",
    documentElement: { lang: "en", dir: "ltr", dataset: { language: "en" }, removeAttribute() {} },
    head: { appendChild(node) { if (node.tagName === "SCRIPT") scripts.push(node); return node; } },
    body: { appendChild(node) { return node; } },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement(tag) { return { tagName: tag.toUpperCase(), setAttribute() {}, remove() {} }; },
  };
  const window = {
    location,
    localStorage: { setItem(key, value) { preferences.set(key, value); }, getItem(key) { return preferences.get(key) ?? null; } },
    setTimeout(callback, ms) { const timer = { callback, ms, active: true }; timers.push(timer); return timer; },
    clearTimeout(timer) { if (timer) timer.active = false; },
    dispatchEvent() {},
  };
  const compiled = ts.transpileModule(translationSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const sandbox = { exports: {}, window, document };
  vm.runInNewContext(compiled, sandbox, { filename: "translation-run-regression.js" });
  const expired = sandbox.exports.requestLanguage("ar", "switch");
  const ceiling = timers.find((timer) => timer.ms > 20_000);
  assert.ok(ceiling, "run ceiling must cover all phase budgets");
  ceiling.callback();
  await sandbox.exports.requestLanguage("en", "switch");
  scripts[0].onerror();
  await expired;
  assert.equal(reloads, 1, "return to source must use an actual navigation");
  assert.equal(location.href, "http://localhost:4173/articles/the-final-message?review=1#introduction", "reload must preserve path, query, and hash");
  assert.equal(preferences.get("the-straight-path-language"), "en", "late failure must not overwrite source preference");
  assert.equal(sandbox.exports.getTranslationRun().target, "en", "late failure must not dismiss the newer navigation overlay");
}

if (baseline) {
  assert.equal(policyAllowsLanguageBootstrap, false, "baseline should demonstrate the missing required origin");
  assert.equal(retry.failedScriptRemoved, false, "baseline should leave its failed tag in place");
  assert.equal(retry.injectedScripts, 1, "baseline should fail to retry the loader");
  log("Baseline reproduces both translation bootstrap regressions.");
} else {
  await expiredRunCannotOverwriteSourceReset();
  assert.equal(policyAllowsLanguageBootstrap, true, "official supported-language JSONP origin must be allowed for script and connections");
  assert.equal(retry.failedScriptRemoved, true, "failed loader attempt must remove its own script");
  assert.equal(retry.injectedScripts, 2, "new language intent must inject a fresh loader after failure");
  assert.deepEqual(scriptSources.filter((value) => value.startsWith("https://")), [
    "https://translate.google.com",
    "https://translate.googleapis.com",
    requiredOrigin,
    "https://www.gstatic.com",
  ], "the script policy must remain a precise provider allowlist");
  for (const directive of ["frame-src https://translate.google.com", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'self'"]) {
    assert.ok(policyDirectives.includes(directive), `security restriction must remain: ${directive}`);
  }
  log("Translation bootstrap policy and loader-retry regressions pass.");
}
