// @ts-expect-error Node test types are outside the browser-only tsconfig.
import assert from "node:assert/strict";
// @ts-expect-error Node test types are outside the browser-only tsconfig.
import { readFileSync } from "node:fs";
// @ts-expect-error Node test types are outside the browser-only tsconfig.
import test from "node:test";
import ts from "typescript";

function load<T>(path: string, mocks: Record<string, unknown>, globals = {}) {
  const source = readFileSync(new URL(`../src/lib/${path}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  const module = { exports: {} };
  const require = (name: string) => {
    assert.ok(Object.hasOwn(mocks, name), `Unexpected dependency: ${name}`);
    return mocks[name];
  };
  new Function("require", "module", "exports", ...Object.keys(globals), outputText)(
    require,
    module,
    module.exports,
    ...Object.values(globals),
  );
  return module.exports as T;
}

function harness(responses: Array<Response | Error>, refresh = true) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  let token = "test-old-token";
  let refreshes = 0;
  const client = load<typeof import("../src/lib/account/client")>(
    "account/client",
    {
      "@/lib/config/endpoints": { HARBOR_API_BASE: "https://harbor.example" },
      "@/lib/theme-auth": {
        authToken: () => token,
        refreshToken: async () => {
          refreshes++;
          token = "test-new-token";
          return refresh;
        },
      },
      "@/lib/safe-fetch": {
        safeFetch: async (url: string, init: RequestInit) => {
          calls.push({ url, init });
          const result = responses.shift();
          if (result instanceof Error) throw result;
          assert.ok(result, "Unexpected request");
          return result;
        },
      },
    },
    {
      fetch: () => {
        throw new Error("Browser-only transport must not be used");
      },
    },
  );
  return { client, calls, refreshes: () => refreshes };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

test("account GET uses native-aware transport, preserves bearer and cancellation on refresh", async () => {
  const h = harness([json({}, 401), json({ user: { badges: [{ name: "dev" }] } })]);
  const signal = new AbortController().signal;
  await h.client.getJson("/identity/api/me", { bearer: true, signal });
  assert.equal(h.refreshes(), 1);
  assert.equal(h.calls.length, 2);
  for (const call of h.calls) {
    assert.equal(call.url, "https://harbor.example/themes/api/identity/api/me");
    assert.equal(call.init.signal, signal);
  }
  assert.equal(new Headers(h.calls[0].init.headers).get("authorization"), "Bearer test-old-token");
  assert.equal(new Headers(h.calls[1].init.headers).get("authorization"), "Bearer test-new-token");
});

test("account POST uses the same transport and refreshes only once without changing body", async () => {
  const h = harness([json({}, 401), json({ ok: true })]);
  await h.client.postJson("/test", { example: true }, { bearer: true });
  assert.equal(h.refreshes(), 1);
  for (const call of h.calls) {
    assert.equal(call.init.method, "POST");
    assert.equal(call.init.body, '{"example":true}');
    assert.equal(new Headers(call.init.headers).get("content-type"), "application/json");
  }
});

test("public account requests omit credentials and never refresh", async () => {
  const h = harness([json({}, 401)]);
  await assert.rejects(h.client.getJson("/test"), { status: 401 });
  assert.equal(h.refreshes(), 0);
  assert.equal(new Headers(h.calls[0].init.headers).has("authorization"), false);
});

test("failed refresh and repeated rejection do not loop", async () => {
  for (const refresh of [false, true]) {
    const h = harness([json({}, 401), json({}, 401)], refresh);
    await assert.rejects(h.client.getJson("/identity/api/me", { bearer: true }), { status: 401 });
    assert.equal(h.refreshes(), 1);
    assert.equal(h.calls.length, refresh ? 2 : 1);
  }
});

test("experimental verification requires server badges and fails closed on rejected credentials", async () => {
  for (const [response, expected] of [
    [json({ user: { badges: [{ name: "dev" }] } }), "allowed"],
    [json({ user: { badges: [] } }), "denied"],
    [json({}), "unavailable"],
    [json(null), "unavailable"],
    [json({ user: {} }), "unavailable"],
    [json({ user: { badges: "admin" } }), "unavailable"],
    [json({}, 401), "unauthenticated"],
    [json({}, 403), "denied"],
    [json({}, 503), "unavailable"],
    [new TypeError("Network unavailable"), "unavailable"],
    [new DOMException("Aborted", "AbortError"), "unavailable"],
  ] as const) {
    const h = harness([response], false);
    const access = load<typeof import("../src/lib/updater/experimental-access")>(
      "updater/experimental-access",
      {
        react: { useSyncExternalStore() {} },
        "@/lib/account/client": h.client,
        "@/lib/theme-auth": {
          currentAuthor: () => ({ badges: [{ name: "admin" }] }),
          applyServerUser() {},
          subscribeAuthor() {},
        },
      },
    );
    assert.equal(await access.verifyExperimentalAccess(), expected);
  }
});
