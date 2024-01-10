try {
  self["workbox:core:7.0.0"] && _();
} catch {
}
const N = (a, ...e) => {
  let t = a;
  return e.length > 0 && (t += ` :: ${JSON.stringify(e)}`), t;
}, v = N;
class l extends Error {
  /**
   *
   * @param {string} errorCode The error code that
   * identifies this particular error.
   * @param {Object=} details Any relevant arguments
   * that will help developers identify issues should
   * be added as a key on the context object.
   */
  constructor(e, t) {
    const s = v(e, t);
    super(s), this.name = e, this.details = t;
  }
}
try {
  self["workbox:routing:7.0.0"] && _();
} catch {
}
const x = "GET", R = (a) => a && typeof a == "object" ? a : { handle: a };
class p {
  /**
   * Constructor for Route class.
   *
   * @param {workbox-routing~matchCallback} match
   * A callback function that determines whether the route matches a given
   * `fetch` event by returning a non-falsy value.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, t, s = x) {
    this.handler = R(t), this.match = e, this.method = s;
  }
  /**
   *
   * @param {workbox-routing-handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response
   */
  setCatchHandler(e) {
    this.catchHandler = R(e);
  }
}
class E extends p {
  /**
   * If both `denylist` and `allowlist` are provided, the `denylist` will
   * take precedence and the request will not match this route.
   *
   * The regular expressions in `allowlist` and `denylist`
   * are matched against the concatenated
   * [`pathname`]{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname}
   * and [`search`]{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/search}
   * portions of the requested URL.
   *
   * *Note*: These RegExps may be evaluated against every destination URL during
   * a navigation. Avoid using
   * [complex RegExps](https://github.com/GoogleChrome/workbox/issues/3077),
   * or else your users may see delays when navigating your site.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {Object} options
   * @param {Array<RegExp>} [options.denylist] If any of these patterns match,
   * the route will not handle the request (even if a allowlist RegExp matches).
   * @param {Array<RegExp>} [options.allowlist=[/./]] If any of these patterns
   * match the URL's pathname and search parameter, the route will handle the
   * request (assuming the denylist doesn't match).
   */
  constructor(e, { allowlist: t = [/./], denylist: s = [] } = {}) {
    super((i) => this._match(i), e), this._allowlist = t, this._denylist = s;
  }
  /**
   * Routes match handler.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {Request} options.request
   * @return {boolean}
   *
   * @private
   */
  _match({ url: e, request: t }) {
    if (t && t.mode !== "navigate")
      return !1;
    const s = e.pathname + e.search;
    for (const i of this._denylist)
      if (i.test(s))
        return !1;
    return !!this._allowlist.some((i) => i.test(s));
  }
}
class I extends p {
  /**
   * If the regular expression contains
   * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
   * the captured values will be passed to the
   * {@link workbox-routing~handlerCallback} `params`
   * argument.
   *
   * @param {RegExp} regExp The regular expression to match against URLs.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, t, s) {
    const i = ({ url: n }) => {
      const r = e.exec(n.href);
      if (r && !(n.origin !== location.origin && r.index !== 0))
        return r.slice(1);
    };
    super(i, t, s);
  }
}
const O = (a) => new URL(String(a), location.href).href.replace(new RegExp(`^${location.origin}`), "");
class M {
  /**
   * Initializes a new Router.
   */
  constructor() {
    this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map();
  }
  /**
   * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
   * method name ('GET', etc.) to an array of all the corresponding `Route`
   * instances that are registered.
   */
  get routes() {
    return this._routes;
  }
  /**
   * Adds a fetch event listener to respond to events when a route matches
   * the event's request.
   */
  addFetchListener() {
    self.addEventListener("fetch", (e) => {
      const { request: t } = e, s = this.handleRequest({ request: t, event: e });
      s && e.respondWith(s);
    });
  }
  /**
   * Adds a message event listener for URLs to cache from the window.
   * This is useful to cache resources loaded on the page prior to when the
   * service worker started controlling it.
   *
   * The format of the message data sent from the window should be as follows.
   * Where the `urlsToCache` array may consist of URL strings or an array of
   * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
   *
   * ```
   * {
   *   type: 'CACHE_URLS',
   *   payload: {
   *     urlsToCache: [
   *       './script1.js',
   *       './script2.js',
   *       ['./script3.js', {mode: 'no-cors'}],
   *     ],
   *   },
   * }
   * ```
   */
  addCacheListener() {
    self.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CACHE_URLS") {
        const { payload: t } = e.data, s = Promise.all(t.urlsToCache.map((i) => {
          typeof i == "string" && (i = [i]);
          const n = new Request(...i);
          return this.handleRequest({ request: n, event: e });
        }));
        e.waitUntil(s), e.ports && e.ports[0] && s.then(() => e.ports[0].postMessage(!0));
      }
    });
  }
  /**
   * Apply the routing rules to a FetchEvent object to get a Response from an
   * appropriate Route's handler.
   *
   * @param {Object} options
   * @param {Request} options.request The request to handle.
   * @param {ExtendableEvent} options.event The event that triggered the
   *     request.
   * @return {Promise<Response>|undefined} A promise is returned if a
   *     registered route can handle the request. If there is no matching
   *     route and there's no `defaultHandler`, `undefined` is returned.
   */
  handleRequest({ request: e, event: t }) {
    const s = new URL(e.url, location.href);
    if (!s.protocol.startsWith("http"))
      return;
    const i = s.origin === location.origin, { params: n, route: r } = this.findMatchingRoute({
      event: t,
      request: e,
      sameOrigin: i,
      url: s
    });
    let c = r && r.handler;
    const o = e.method;
    if (!c && this._defaultHandlerMap.has(o) && (c = this._defaultHandlerMap.get(o)), !c)
      return;
    let h;
    try {
      h = c.handle({ url: s, request: e, event: t, params: n });
    } catch (u) {
      h = Promise.reject(u);
    }
    const g = r && r.catchHandler;
    return h instanceof Promise && (this._catchHandler || g) && (h = h.catch(async (u) => {
      if (g)
        try {
          return await g.handle({ url: s, request: e, event: t, params: n });
        } catch (k) {
          k instanceof Error && (u = k);
        }
      if (this._catchHandler)
        return this._catchHandler.handle({ url: s, request: e, event: t });
      throw u;
    })), h;
  }
  /**
   * Checks a request and URL (and optionally an event) against the list of
   * registered routes, and if there's a match, returns the corresponding
   * route along with any params generated by the match.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {boolean} options.sameOrigin The result of comparing `url.origin`
   *     against the current origin.
   * @param {Request} options.request The request to match.
   * @param {Event} options.event The corresponding event.
   * @return {Object} An object with `route` and `params` properties.
   *     They are populated if a matching route was found or `undefined`
   *     otherwise.
   */
  findMatchingRoute({ url: e, sameOrigin: t, request: s, event: i }) {
    const n = this._routes.get(s.method) || [];
    for (const r of n) {
      let c;
      const o = r.match({ url: e, sameOrigin: t, request: s, event: i });
      if (o)
        return c = o, (Array.isArray(c) && c.length === 0 || o.constructor === Object && // eslint-disable-line
        Object.keys(o).length === 0 || typeof o == "boolean") && (c = void 0), { route: r, params: c };
    }
    return {};
  }
  /**
   * Define a default `handler` that's called when no routes explicitly
   * match the incoming request.
   *
   * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
   *
   * Without a default handler, unmatched requests will go against the
   * network as if there were no service worker present.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to associate with this
   * default handler. Each method has its own default.
   */
  setDefaultHandler(e, t = x) {
    this._defaultHandlerMap.set(t, R(e));
  }
  /**
   * If a Route throws an error while handling a request, this `handler`
   * will be called and given a chance to provide a response.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   */
  setCatchHandler(e) {
    this._catchHandler = R(e);
  }
  /**
   * Registers a route with the router.
   *
   * @param {workbox-routing.Route} route The route to register.
   */
  registerRoute(e) {
    this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  /**
   * Unregisters a route with the router.
   *
   * @param {workbox-routing.Route} route The route to unregister.
   */
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new l("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const t = this._routes.get(e.method).indexOf(e);
    if (t > -1)
      this._routes.get(e.method).splice(t, 1);
    else
      throw new l("unregister-route-route-not-registered");
  }
}
let y;
const A = () => (y || (y = new M(), y.addFetchListener(), y.addCacheListener()), y);
function T(a, e, t) {
  let s;
  if (typeof a == "string") {
    const n = new URL(a, location.href), r = ({ url: c }) => c.href === n.href;
    s = new p(r, e, t);
  } else if (a instanceof RegExp)
    s = new I(a, e, t);
  else if (typeof a == "function")
    s = new p(a, e, t);
  else if (a instanceof p)
    s = a;
  else
    throw new l("unsupported-route-type", {
      moduleName: "workbox-routing",
      funcName: "registerRoute",
      paramName: "capture"
    });
  return A().registerRoute(s), s;
}
const S = /* @__PURE__ */ new Set(), f = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "workbox",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, b = (a) => [f.prefix, a, f.suffix].filter((e) => e && e.length > 0).join("-"), q = (a) => {
  for (const e of Object.keys(f))
    a(e);
}, C = {
  updateDetails: (a) => {
    q((e) => {
      typeof a[e] == "string" && (f[e] = a[e]);
    });
  },
  getGoogleAnalyticsName: (a) => a || b(f.googleAnalytics),
  getPrecacheName: (a) => a || b(f.precache),
  getPrefix: () => f.prefix,
  getRuntimeName: (a) => a || b(f.runtime),
  getSuffix: () => f.suffix
};
function P(a, e) {
  const t = new URL(a);
  for (const s of e)
    t.searchParams.delete(s);
  return t.href;
}
async function W(a, e, t, s) {
  const i = P(e.url, t);
  if (e.url === i)
    return a.match(e, s);
  const n = Object.assign(Object.assign({}, s), { ignoreSearch: !0 }), r = await a.keys(e, n);
  for (const c of r) {
    const o = P(c.url, t);
    if (i === o)
      return a.match(c, s);
  }
}
let w;
function D() {
  if (w === void 0) {
    const a = new Response("");
    if ("body" in a)
      try {
        new Response(a.body), w = !0;
      } catch {
        w = !1;
      }
    w = !1;
  }
  return w;
}
class H {
  /**
   * Creates a promise and exposes its resolve and reject functions as methods.
   */
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
async function j() {
  for (const a of S)
    await a();
}
function F(a) {
  return new Promise((e) => setTimeout(e, a));
}
function K(a, e) {
  const t = e();
  return a.waitUntil(t), t;
}
async function B(a, e) {
  let t = null;
  if (a.url && (t = new URL(a.url).origin), t !== self.location.origin)
    throw new l("cross-origin-copy-response", { origin: t });
  const s = a.clone(), i = {
    headers: new Headers(s.headers),
    status: s.status,
    statusText: s.statusText
  }, n = e ? e(i) : i, r = D() ? s.body : await s.blob();
  return new Response(r, n);
}
function $() {
  self.addEventListener("activate", () => self.clients.claim());
}
try {
  self["workbox:precaching:7.0.0"] && _();
} catch {
}
const G = "__WB_REVISION__";
function V(a) {
  if (!a)
    throw new l("add-to-cache-list-unexpected-type", { entry: a });
  if (typeof a == "string") {
    const n = new URL(a, location.href);
    return {
      cacheKey: n.href,
      url: n.href
    };
  }
  const { revision: e, url: t } = a;
  if (!t)
    throw new l("add-to-cache-list-unexpected-type", { entry: a });
  if (!e) {
    const n = new URL(t, location.href);
    return {
      cacheKey: n.href,
      url: n.href
    };
  }
  const s = new URL(t, location.href), i = new URL(t, location.href);
  return s.searchParams.set(G, e), {
    cacheKey: s.href,
    url: i.href
  };
}
class Q {
  constructor() {
    this.updatedURLs = [], this.notUpdatedURLs = [], this.handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    }, this.cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: s }) => {
      if (e.type === "install" && t && t.originalRequest && t.originalRequest instanceof Request) {
        const i = t.originalRequest.url;
        s ? this.notUpdatedURLs.push(i) : this.updatedURLs.push(i);
      }
      return s;
    };
  }
}
class z {
  constructor({ precacheController: e }) {
    this.cacheKeyWillBeUsed = async ({ request: t, params: s }) => {
      const i = (s == null ? void 0 : s.cacheKey) || this._precacheController.getCacheKeyForURL(t.url);
      return i ? new Request(i, { headers: t.headers }) : t;
    }, this._precacheController = e;
  }
}
try {
  self["workbox:strategies:7.0.0"] && _();
} catch {
}
function m(a) {
  return typeof a == "string" ? new Request(a) : a;
}
class J {
  /**
   * Creates a new instance associated with the passed strategy and event
   * that's handling the request.
   *
   * The constructor also initializes the state that will be passed to each of
   * the plugins handling this request.
   *
   * @param {workbox-strategies.Strategy} strategy
   * @param {Object} options
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params] The return value from the
   *     {@link workbox-routing~matchCallback} (if applicable).
   */
  constructor(e, t) {
    this._cacheKeys = {}, Object.assign(this, t), this.event = t.event, this._strategy = e, this._handlerDeferred = new H(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const s of this._plugins)
      this._pluginStateMap.set(s, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  /**
   * Fetches a given request (and invokes any applicable plugin callback
   * methods) using the `fetchOptions` (for non-navigation requests) and
   * `plugins` defined on the `Strategy` object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - `requestWillFetch()`
   * - `fetchDidSucceed()`
   * - `fetchDidFail()`
   *
   * @param {Request|string} input The URL or request to fetch.
   * @return {Promise<Response>}
   */
  async fetch(e) {
    const { event: t } = this;
    let s = m(e);
    if (s.mode === "navigate" && t instanceof FetchEvent && t.preloadResponse) {
      const r = await t.preloadResponse;
      if (r)
        return r;
    }
    const i = this.hasCallback("fetchDidFail") ? s.clone() : null;
    try {
      for (const r of this.iterateCallbacks("requestWillFetch"))
        s = await r({ request: s.clone(), event: t });
    } catch (r) {
      if (r instanceof Error)
        throw new l("plugin-error-request-will-fetch", {
          thrownErrorMessage: r.message
        });
    }
    const n = s.clone();
    try {
      let r;
      r = await fetch(s, s.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
      for (const c of this.iterateCallbacks("fetchDidSucceed"))
        r = await c({
          event: t,
          request: n,
          response: r
        });
      return r;
    } catch (r) {
      throw i && await this.runCallbacks("fetchDidFail", {
        error: r,
        event: t,
        originalRequest: i.clone(),
        request: n.clone()
      }), r;
    }
  }
  /**
   * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
   * the response generated by `this.fetch()`.
   *
   * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
   * so you do not have to manually call `waitUntil()` on the event.
   *
   * @param {Request|string} input The request or URL to fetch and cache.
   * @return {Promise<Response>}
   */
  async fetchAndCachePut(e) {
    const t = await this.fetch(e), s = t.clone();
    return this.waitUntil(this.cachePut(e, s)), t;
  }
  /**
   * Matches a request from the cache (and invokes any applicable plugin
   * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
   * defined on the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cachedResponseWillByUsed()
   *
   * @param {Request|string} key The Request or URL to use as the cache key.
   * @return {Promise<Response|undefined>} A matching response, if found.
   */
  async cacheMatch(e) {
    const t = m(e);
    let s;
    const { cacheName: i, matchOptions: n } = this._strategy, r = await this.getCacheKey(t, "read"), c = Object.assign(Object.assign({}, n), { cacheName: i });
    s = await caches.match(r, c);
    for (const o of this.iterateCallbacks("cachedResponseWillBeUsed"))
      s = await o({
        cacheName: i,
        matchOptions: n,
        cachedResponse: s,
        request: r,
        event: this.event
      }) || void 0;
    return s;
  }
  /**
   * Puts a request/response pair in the cache (and invokes any applicable
   * plugin callback methods) using the `cacheName` and `plugins` defined on
   * the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cacheWillUpdate()
   * - cacheDidUpdate()
   *
   * @param {Request|string} key The request or URL to use as the cache key.
   * @param {Response} response The response to cache.
   * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
   * not be cached, and `true` otherwise.
   */
  async cachePut(e, t) {
    const s = m(e);
    await F(0);
    const i = await this.getCacheKey(s, "write");
    if (!t)
      throw new l("cache-put-with-no-response", {
        url: O(i.url)
      });
    const n = await this._ensureResponseSafeToCache(t);
    if (!n)
      return !1;
    const { cacheName: r, matchOptions: c } = this._strategy, o = await self.caches.open(r), h = this.hasCallback("cacheDidUpdate"), g = h ? await W(
      // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
      // feature. Consider into ways to only add this behavior if using
      // precaching.
      o,
      i.clone(),
      ["__WB_REVISION__"],
      c
    ) : null;
    try {
      await o.put(i, h ? n.clone() : n);
    } catch (u) {
      if (u instanceof Error)
        throw u.name === "QuotaExceededError" && await j(), u;
    }
    for (const u of this.iterateCallbacks("cacheDidUpdate"))
      await u({
        cacheName: r,
        oldResponse: g,
        newResponse: n.clone(),
        request: i,
        event: this.event
      });
    return !0;
  }
  /**
   * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
   * executes any of those callbacks found in sequence. The final `Request`
   * object returned by the last plugin is treated as the cache key for cache
   * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
   * been registered, the passed request is returned unmodified
   *
   * @param {Request} request
   * @param {string} mode
   * @return {Promise<Request>}
   */
  async getCacheKey(e, t) {
    const s = `${e.url} | ${t}`;
    if (!this._cacheKeys[s]) {
      let i = e;
      for (const n of this.iterateCallbacks("cacheKeyWillBeUsed"))
        i = m(await n({
          mode: t,
          request: i,
          event: this.event,
          // params has a type any can't change right now.
          params: this.params
          // eslint-disable-line
        }));
      this._cacheKeys[s] = i;
    }
    return this._cacheKeys[s];
  }
  /**
   * Returns true if the strategy has at least one plugin with the given
   * callback.
   *
   * @param {string} name The name of the callback to check for.
   * @return {boolean}
   */
  hasCallback(e) {
    for (const t of this._strategy.plugins)
      if (e in t)
        return !0;
    return !1;
  }
  /**
   * Runs all plugin callbacks matching the given name, in order, passing the
   * given param object (merged ith the current plugin state) as the only
   * argument.
   *
   * Note: since this method runs all plugins, it's not suitable for cases
   * where the return value of a callback needs to be applied prior to calling
   * the next callback. See
   * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
   * below for how to handle that case.
   *
   * @param {string} name The name of the callback to run within each plugin.
   * @param {Object} param The object to pass as the first (and only) param
   *     when executing each callback. This object will be merged with the
   *     current plugin state prior to callback execution.
   */
  async runCallbacks(e, t) {
    for (const s of this.iterateCallbacks(e))
      await s(t);
  }
  /**
   * Accepts a callback and returns an iterable of matching plugin callbacks,
   * where each callback is wrapped with the current handler state (i.e. when
   * you call each callback, whatever object parameter you pass it will
   * be merged with the plugin's current state).
   *
   * @param {string} name The name fo the callback to run
   * @return {Array<Function>}
   */
  *iterateCallbacks(e) {
    for (const t of this._strategy.plugins)
      if (typeof t[e] == "function") {
        const s = this._pluginStateMap.get(t);
        yield (n) => {
          const r = Object.assign(Object.assign({}, n), { state: s });
          return t[e](r);
        };
      }
  }
  /**
   * Adds a promise to the
   * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
   * of the event event associated with the request being handled (usually a
   * `FetchEvent`).
   *
   * Note: you can await
   * {@link workbox-strategies.StrategyHandler~doneWaiting}
   * to know when all added promises have settled.
   *
   * @param {Promise} promise A promise to add to the extend lifetime promises
   *     of the event that triggered the request.
   */
  waitUntil(e) {
    return this._extendLifetimePromises.push(e), e;
  }
  /**
   * Returns a promise that resolves once all promises passed to
   * {@link workbox-strategies.StrategyHandler~waitUntil}
   * have settled.
   *
   * Note: any work done after `doneWaiting()` settles should be manually
   * passed to an event's `waitUntil()` method (not this handler's
   * `waitUntil()` method), otherwise the service worker thread my be killed
   * prior to your work completing.
   */
  async doneWaiting() {
    let e;
    for (; e = this._extendLifetimePromises.shift(); )
      await e;
  }
  /**
   * Stops running the strategy and immediately resolves any pending
   * `waitUntil()` promises.
   */
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  /**
   * This method will call cacheWillUpdate on the available plugins (or use
   * status === 200) to determine if the Response is safe and valid to cache.
   *
   * @param {Request} options.request
   * @param {Response} options.response
   * @return {Promise<Response|undefined>}
   *
   * @private
   */
  async _ensureResponseSafeToCache(e) {
    let t = e, s = !1;
    for (const i of this.iterateCallbacks("cacheWillUpdate"))
      if (t = await i({
        request: this.request,
        response: t,
        event: this.event
      }) || void 0, s = !0, !t)
        break;
    return s || t && t.status !== 200 && (t = void 0), t;
  }
}
class X {
  /**
   * Creates a new instance of the strategy and sets all documented option
   * properties as public instance properties.
   *
   * Note: if a custom strategy class extends the base Strategy class and does
   * not need more than these properties, it does not need to define its own
   * constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   */
  constructor(e = {}) {
    this.cacheName = C.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  /**
   * Perform a request strategy and returns a `Promise` that will resolve with
   * a `Response`, invoking all relevant plugin callbacks.
   *
   * When a strategy instance is registered with a Workbox
   * {@link workbox-routing.Route}, this method is automatically
   * called when the route matches.
   *
   * Alternatively, this method can be used in a standalone `FetchEvent`
   * listener by passing it to `event.respondWith()`.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   */
  handle(e) {
    const [t] = this.handleAll(e);
    return t;
  }
  /**
   * Similar to {@link workbox-strategies.Strategy~handle}, but
   * instead of just returning a `Promise` that resolves to a `Response` it
   * it will return an tuple of `[response, done]` promises, where the former
   * (`response`) is equivalent to what `handle()` returns, and the latter is a
   * Promise that will resolve once any promises that were added to
   * `event.waitUntil()` as part of performing the strategy have completed.
   *
   * You can await the `done` promise to ensure any extra work performed by
   * the strategy (usually caching responses) completes successfully.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   * @return {Array<Promise>} A tuple of [response, done]
   *     promises that can be used to determine when the response resolves as
   *     well as when the handler has completed all its work.
   */
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const t = e.event, s = typeof e.request == "string" ? new Request(e.request) : e.request, i = "params" in e ? e.params : void 0, n = new J(this, { event: t, request: s, params: i }), r = this._getResponse(n, s, t), c = this._awaitComplete(r, n, s, t);
    return [r, c];
  }
  async _getResponse(e, t, s) {
    await e.runCallbacks("handlerWillStart", { event: s, request: t });
    let i;
    try {
      if (i = await this._handle(t, e), !i || i.type === "error")
        throw new l("no-response", { url: t.url });
    } catch (n) {
      if (n instanceof Error) {
        for (const r of e.iterateCallbacks("handlerDidError"))
          if (i = await r({ error: n, event: s, request: t }), i)
            break;
      }
      if (!i)
        throw n;
    }
    for (const n of e.iterateCallbacks("handlerWillRespond"))
      i = await n({ event: s, request: t, response: i });
    return i;
  }
  async _awaitComplete(e, t, s, i) {
    let n, r;
    try {
      n = await e;
    } catch {
    }
    try {
      await t.runCallbacks("handlerDidRespond", {
        event: i,
        request: s,
        response: n
      }), await t.doneWaiting();
    } catch (c) {
      c instanceof Error && (r = c);
    }
    if (await t.runCallbacks("handlerDidComplete", {
      event: i,
      request: s,
      response: n,
      error: r
    }), t.destroy(), r)
      throw r;
  }
}
class d extends X {
  /**
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
   * of all fetch() requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor(e = {}) {
    e.cacheName = C.getPrecacheName(e.cacheName), super(e), this._fallbackToNetwork = e.fallbackToNetwork !== !1, this.plugins.push(d.copyRedirectedCacheableResponsesPlugin);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, t) {
    const s = await t.cacheMatch(e);
    return s || (t.event && t.event.type === "install" ? await this._handleInstall(e, t) : await this._handleFetch(e, t));
  }
  async _handleFetch(e, t) {
    let s;
    const i = t.params || {};
    if (this._fallbackToNetwork) {
      const n = i.integrity, r = e.integrity, c = !r || r === n;
      s = await t.fetch(new Request(e, {
        integrity: e.mode !== "no-cors" ? r || n : void 0
      })), n && c && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, s.clone()));
    } else
      throw new l("missing-precache-entry", {
        cacheName: this.cacheName,
        url: e.url
      });
    return s;
  }
  async _handleInstall(e, t) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const s = await t.fetch(e);
    if (!await t.cachePut(e, s.clone()))
      throw new l("bad-precaching-response", {
        url: e.url,
        status: s.status
      });
    return s;
  }
  /**
   * This method is complex, as there a number of things to account for:
   *
   * The `plugins` array can be set at construction, and/or it might be added to
   * to at any time before the strategy is used.
   *
   * At the time the strategy is used (i.e. during an `install` event), there
   * needs to be at least one plugin that implements `cacheWillUpdate` in the
   * array, other than `copyRedirectedCacheableResponsesPlugin`.
   *
   * - If this method is called and there are no suitable `cacheWillUpdate`
   * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
   *
   * - If this method is called and there is exactly one `cacheWillUpdate`, then
   * we don't have to do anything (this might be a previously added
   * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
   *
   * - If this method is called and there is more than one `cacheWillUpdate`,
   * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
   * we need to remove it. (This situation is unlikely, but it could happen if
   * the strategy is used multiple times, the first without a `cacheWillUpdate`,
   * and then later on after manually adding a custom `cacheWillUpdate`.)
   *
   * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
   *
   * @private
   */
  _useDefaultCacheabilityPluginIfNeeded() {
    let e = null, t = 0;
    for (const [s, i] of this.plugins.entries())
      i !== d.copyRedirectedCacheableResponsesPlugin && (i === d.defaultPrecacheCacheabilityPlugin && (e = s), i.cacheWillUpdate && t++);
    t === 0 ? this.plugins.push(d.defaultPrecacheCacheabilityPlugin) : t > 1 && e !== null && this.plugins.splice(e, 1);
  }
}
d.defaultPrecacheCacheabilityPlugin = {
  async cacheWillUpdate({ response: a }) {
    return !a || a.status >= 400 ? null : a;
  }
};
d.copyRedirectedCacheableResponsesPlugin = {
  async cacheWillUpdate({ response: a }) {
    return a.redirected ? await B(a) : a;
  }
};
class Y {
  /**
   * Create a new PrecacheController.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] The cache to use for precaching.
   * @param {string} [options.plugins] Plugins to use when precaching as well
   * as responding to fetch events for precached assets.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor({ cacheName: e, plugins: t = [], fallbackToNetwork: s = !0 } = {}) {
    this._urlsToCacheKeys = /* @__PURE__ */ new Map(), this._urlsToCacheModes = /* @__PURE__ */ new Map(), this._cacheKeysToIntegrities = /* @__PURE__ */ new Map(), this._strategy = new d({
      cacheName: C.getPrecacheName(e),
      plugins: [
        ...t,
        new z({ precacheController: this })
      ],
      fallbackToNetwork: s
    }), this.install = this.install.bind(this), this.activate = this.activate.bind(this);
  }
  /**
   * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
   * used to cache assets and respond to fetch events.
   */
  get strategy() {
    return this._strategy;
  }
  /**
   * Adds items to the precache list, removing any duplicates and
   * stores the files in the
   * {@link workbox-core.cacheNames|"precache cache"} when the service
   * worker installs.
   *
   * This method can be called multiple times.
   *
   * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
   */
  precache(e) {
    this.addToCacheList(e), this._installAndActiveListenersAdded || (self.addEventListener("install", this.install), self.addEventListener("activate", this.activate), this._installAndActiveListenersAdded = !0);
  }
  /**
   * This method will add items to the precache list, removing duplicates
   * and ensuring the information is valid.
   *
   * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
   *     Array of entries to precache.
   */
  addToCacheList(e) {
    const t = [];
    for (const s of e) {
      typeof s == "string" ? t.push(s) : s && s.revision === void 0 && t.push(s.url);
      const { cacheKey: i, url: n } = V(s), r = typeof s != "string" && s.revision ? "reload" : "default";
      if (this._urlsToCacheKeys.has(n) && this._urlsToCacheKeys.get(n) !== i)
        throw new l("add-to-cache-list-conflicting-entries", {
          firstEntry: this._urlsToCacheKeys.get(n),
          secondEntry: i
        });
      if (typeof s != "string" && s.integrity) {
        if (this._cacheKeysToIntegrities.has(i) && this._cacheKeysToIntegrities.get(i) !== s.integrity)
          throw new l("add-to-cache-list-conflicting-integrities", {
            url: n
          });
        this._cacheKeysToIntegrities.set(i, s.integrity);
      }
      if (this._urlsToCacheKeys.set(n, i), this._urlsToCacheModes.set(n, r), t.length > 0) {
        const c = `Workbox is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
        console.warn(c);
      }
    }
  }
  /**
   * Precaches new and updated assets. Call this method from the service worker
   * install event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.InstallResult>}
   */
  install(e) {
    return K(e, async () => {
      const t = new Q();
      this.strategy.plugins.push(t);
      for (const [n, r] of this._urlsToCacheKeys) {
        const c = this._cacheKeysToIntegrities.get(r), o = this._urlsToCacheModes.get(n), h = new Request(n, {
          integrity: c,
          cache: o,
          credentials: "same-origin"
        });
        await Promise.all(this.strategy.handleAll({
          params: { cacheKey: r },
          request: h,
          event: e
        }));
      }
      const { updatedURLs: s, notUpdatedURLs: i } = t;
      return { updatedURLs: s, notUpdatedURLs: i };
    });
  }
  /**
   * Deletes assets that are no longer present in the current precache manifest.
   * Call this method from the service worker activate event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.CleanupResult>}
   */
  activate(e) {
    return K(e, async () => {
      const t = await self.caches.open(this.strategy.cacheName), s = await t.keys(), i = new Set(this._urlsToCacheKeys.values()), n = [];
      for (const r of s)
        i.has(r.url) || (await t.delete(r), n.push(r.url));
      return { deletedURLs: n };
    });
  }
  /**
   * Returns a mapping of a precached URL to the corresponding cache key, taking
   * into account the revision information for the URL.
   *
   * @return {Map<string, string>} A URL to cache key mapping.
   */
  getURLsToCacheKeys() {
    return this._urlsToCacheKeys;
  }
  /**
   * Returns a list of all the URLs that have been precached by the current
   * service worker.
   *
   * @return {Array<string>} The precached URLs.
   */
  getCachedURLs() {
    return [...this._urlsToCacheKeys.keys()];
  }
  /**
   * Returns the cache key used for storing a given URL. If that URL is
   * unversioned, like `/index.html', then the cache key will be the original
   * URL with a search parameter appended to it.
   *
   * @param {string} url A URL whose cache key you want to look up.
   * @return {string} The versioned URL that corresponds to a cache key
   * for the original URL, or undefined if that URL isn't precached.
   */
  getCacheKeyForURL(e) {
    const t = new URL(e, location.href);
    return this._urlsToCacheKeys.get(t.href);
  }
  /**
   * @param {string} url A cache key whose SRI you want to look up.
   * @return {string} The subresource integrity associated with the cache key,
   * or undefined if it's not set.
   */
  getIntegrityForCacheKey(e) {
    return this._cacheKeysToIntegrities.get(e);
  }
  /**
   * This acts as a drop-in replacement for
   * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
   * with the following differences:
   *
   * - It knows what the name of the precache is, and only checks in that cache.
   * - It allows you to pass in an "original" URL without versioning parameters,
   * and it will automatically look up the correct cache key for the currently
   * active revision of that URL.
   *
   * E.g., `matchPrecache('index.html')` will find the correct precached
   * response for the currently active service worker, even if the actual cache
   * key is `'/index.html?__WB_REVISION__=1234abcd'`.
   *
   * @param {string|Request} request The key (without revisioning parameters)
   * to look up in the precache.
   * @return {Promise<Response|undefined>}
   */
  async matchPrecache(e) {
    const t = e instanceof Request ? e.url : e, s = this.getCacheKeyForURL(t);
    if (s)
      return (await self.caches.open(this.strategy.cacheName)).match(s);
  }
  /**
   * Returns a function that looks up `url` in the precache (taking into
   * account revision information), and returns the corresponding `Response`.
   *
   * @param {string} url The precached URL which will be used to lookup the
   * `Response`.
   * @return {workbox-routing~handlerCallback}
   */
  createHandlerBoundToURL(e) {
    const t = this.getCacheKeyForURL(e);
    if (!t)
      throw new l("non-precached-url", { url: e });
    return (s) => (s.request = new Request(e), s.params = Object.assign({ cacheKey: t }, s.params), this.strategy.handle(s));
  }
}
let L;
const U = () => (L || (L = new Y()), L);
function Z(a, e = []) {
  for (const t of [...a.searchParams.keys()])
    e.some((s) => s.test(t)) && a.searchParams.delete(t);
  return a;
}
function* ee(a, { ignoreURLParametersMatching: e = [/^utm_/, /^fbclid$/], directoryIndex: t = "index.html", cleanURLs: s = !0, urlManipulation: i } = {}) {
  const n = new URL(a, location.href);
  n.hash = "", yield n.href;
  const r = Z(n, e);
  if (yield r.href, t && r.pathname.endsWith("/")) {
    const c = new URL(r.href);
    c.pathname += t, yield c.href;
  }
  if (s) {
    const c = new URL(r.href);
    c.pathname += ".html", yield c.href;
  }
  if (i) {
    const c = i({ url: n });
    for (const o of c)
      yield o.href;
  }
}
class te extends p {
  /**
   * @param {PrecacheController} precacheController A `PrecacheController`
   * instance used to both match requests and respond to fetch events.
   * @param {Object} [options] Options to control how requests are matched
   * against the list of precached URLs.
   * @param {string} [options.directoryIndex=index.html] The `directoryIndex` will
   * check cache entries for a URLs ending with '/' to see if there is a hit when
   * appending the `directoryIndex` value.
   * @param {Array<RegExp>} [options.ignoreURLParametersMatching=[/^utm_/, /^fbclid$/]] An
   * array of regex's to remove search params when looking for a cache match.
   * @param {boolean} [options.cleanURLs=true] The `cleanURLs` option will
   * check the cache for the URL with a `.html` added to the end of the end.
   * @param {workbox-precaching~urlManipulation} [options.urlManipulation]
   * This is a function that should take a URL and return an array of
   * alternative URLs that should be checked for precache matches.
   */
  constructor(e, t) {
    const s = ({ request: i }) => {
      const n = e.getURLsToCacheKeys();
      for (const r of ee(i.url, t)) {
        const c = n.get(r);
        if (c) {
          const o = e.getIntegrityForCacheKey(c);
          return { cacheKey: c, integrity: o };
        }
      }
    };
    super(s, e.strategy);
  }
}
function se(a) {
  const e = U(), t = new te(e, a);
  T(t);
}
const ae = "-precache-", ie = async (a, e = ae) => {
  const s = (await self.caches.keys()).filter((i) => i.includes(e) && i.includes(self.registration.scope) && i !== a);
  return await Promise.all(s.map((i) => self.caches.delete(i))), s;
};
function ne() {
  self.addEventListener("activate", (a) => {
    const e = C.getPrecacheName();
    a.waitUntil(ie(e).then((t) => {
    }));
  });
}
function re(a) {
  return U().createHandlerBoundToURL(a);
}
function ce(a) {
  U().precache(a);
}
function oe(a, e) {
  ce(a), se(e);
}
const le = [
  /^\/about/i,
  /^\/site\/about/i,
  /^\/baidubaike_cs/i,
  /^\/site\/baidubaike_cs/i,
  /^\/introLanding/i,
  /^\/site\/introLanding/i,
  /^\/introLandingMo/i,
  /^\/site\/introLandingMo/i,
  /^\/privacySettings/i,
  /^\/site\/privacySettings/i,
  /^\/informedConsent/i,
  /^\/site\/informedConsent/i,
  /^\/share\/test/i,
  /^\/recent/i,
  /^\/file\/recent/i,
  /^\/search/i,
  /^\/file\/search/i,
  /^\/manager/i,
  /^\/file\/manager/i,
  /^\/message/i,
  /^\/file\/message/i,
  /^\/detail/i,
  /^\/file\/detail/i,
  /^\/recycler/i,
  /^\/file\/recycler/i,
  /^\/l\//i,
  /^\/ll\//i,
  /^\/share\/list/i,
  /^\/team\//i,
  /^\/qrcode/i,
  /^\/user\/qrcode/i,
  /^\/payment/i,
  /^\/user\/payment/i,
  /^\/partnership/i,
  /^\/user\/partnership/i,
  /^\/enterprise/i,
  /^\/user\/enterprise/i,
  /^\/transferLanding/i,
  /^\/user\/transferLanding/i,
  /^\/login/i,
  /^\/user\/login/i,
  /^\/questionnaire/i,
  /^\/user\/questionnaire/i,
  /^\/login_packing/i,
  /^\/user\/login_packing/i,
  /^\/register/i,
  /^\/user\/register/i,
  /^\/forgat/i,
  /^\/user\/forgat/i,
  /^\/user\/download/i,
  /^\/help/i,
  /^\/user\/help/i,
  /^\/premium\/index/i,
  /^\/user\/premium\/index/i,
  /^\/premium\/business/i,
  /^\/user\/premium\/business/i,
  /^\/main/i,
  /^\/tools\/main/i,
  /^\/pdftopic/i,
  /^\/tools\/pdftopic/i,
  /^\/pdftoword/i,
  /^\/tools\/pdftoword/i,
  /^\/pdftoexcel/i,
  /^\/tools\/pdftoexcel/i,
  /^\/pdftoppt/i,
  /^\/tools\/pdftoppt/i,
  /^\/wordtopdf/i,
  /^\/tools\/wordtopdf/i,
  /^\/exceltopdf/i,
  /^\/tools\/exceltopdf/i,
  /^\/ppttopdf/i,
  /^\/tools\/ppttopdf/i,
  /^\/pictopdf/i,
  /^\/tools\/pictopdf/i,
  /^\/mergepdf/i,
  /^\/tools\/mergepdf/i,
  /^\/extractpdfpages/i,
  /^\/tools\/extractpdfpages/i,
  /^\/rearrangepdfpages/i,
  /^\/tools\/rearrangepdfpages/i,
  /^\/rotatepdf/i,
  /^\/tools\/rotatepdf/i,
  /^\/deletepagesfrompdf/i,
  /^\/tools\/deletepagesfrompdf/i,
  /^\/webocr/i,
  /^\/tools\/webocr/i,
  /^\/openApp/i,
  /^\/app\/openApp/i,
  /^\/control\/enterprise/i
];
ne();
$();
oe([{"revision":"a5f173f86c446a210968b61419225127","url":"/login"},{"revision":"7e52d60f04022da53e8e6dd7e00b32c8","url":"favicon.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/account_pay_sprite-50dd2128.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/alipay-77320aa1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/android_browser-2a0378e6.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/anquanguanli-113f3b16.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ArSa-a83f463c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ArSa-legacy-0274ee52.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BaiduBaikeCs-bc8f4c9f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BaiduBaikeCs-d90f9c68.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BaiduBaikeCs-legacy-a96280d2.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner_bj-8433aafc.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner_bj-a259d0a8.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner_bottom-ff72f9f2.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner_ch_1400_490-f312d03f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner_download-cb5667ae.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner_en_1400_490-bfec0a8d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner_right-cb504df3.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner-bc951e93.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner-c3498958.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner-cb76f40b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner-dd2811d9.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner1_C-480e6cef.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner1_E-1f048ce4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner2_C-4860f66d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner2_E-45b35962.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner2_E1-0d5deee0.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner3_C-d6ec03fb.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner3_E-e255b1a4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/banner3_E1-3d9b1609.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BaseConvert-8de002db.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BaseConvert-ff6ccbaf.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BaseConvert-legacy-06b7debe.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/bg_banner_1400_490-d5a0b50d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/bg_home_finance_5-9a8daa62.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/bg_home_process_6-8a2e2686.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/bg-b3b8d022.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/bg-c4835fd8.jpg"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/blacken-fe21a424.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/bottom_banner-bfac817f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/bottom_banner-ddf71b79.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/botton_icon-ddcd60f7.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/brighten-0b50fc99.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BusinessComponent-76925b2f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BusinessComponent-f6eb18ad.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BusinessComponent-legacy-e8ca47fd.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BusinessPage-12957e38.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BusinessPage-515f1032.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/BusinessPage-legacy-d50efad4.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/button-web-3cad90f4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/caigou-92200d97.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/camera-848623e6.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/card-fa1ec5e8.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/center_bg-a612b2e5.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/CommonTooltipBlack-c74fe691.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/CommonTooltipBlack-dc42593b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/CommonTooltipBlack-legacy-5364e68b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/config-8adb8f72.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/config-legacy-c3c969c1.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/consult-a6379bbf.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/contact_info-1c43449e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/contact-f2a33873.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/content_loading-60c6cd5d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/content_loading-legacy-22cc9946.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/crop_en-3bec6c1c.mp4"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/crop-12e70d8b.mp4"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/crop-4d243dfa.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/crop-bece8826.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/cs_loading-37737697.gif"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/cs_logo_xl-90b49781.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/cs_pc-71b4951a.ttf"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/cs_pc-961ae219.eot"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/cs_pc-a0a0a57d.woff"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/cs_pc-f7bc8af2.svg"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/CsCs-5c00d353.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/CsCs-legacy-aabf3f36.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/css_sprites-22e34d25.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/css_sprites-e4e3d1dd.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DeDe-26239b44.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DeDe-legacy-513f6517.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/dengbao-87e818db.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DJCP-e1ab74df.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DocInfoReportDialog-81317c15.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DocInfoReportDialog-dde0b943.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DocInfoReportDialog-legacy-d06ee3a7.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DocTagDialog-0a267790.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DocTagDialog-6fc78b63.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DocTagDialog-legacy-fe70d34c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DownLoad-813ad90d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DownLoad-c5639477.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/DownLoad-legacy-f828f707.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/downLoadBigFile-977c88aa.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/downLoadBigFile-legacy-7c97a1b9.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EduAuth-4edce0ef.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EduAuth-c7a81e1f.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EduAuth-legacy-b6735157.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/enhance-e84dbb41.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseContact-626289af.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseContact-9d7498cb.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseContact-legacy-c1b379c9.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseDesktop-85de8308.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseDesktop-df838b3e.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseDesktop-legacy-f5251cb3.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseMobile-67775dfe.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseMobile-e413ca82.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnterpriseMobile-legacy-4a6e4ad5.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnUs-642c3458.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EnUs-legacy-3adad25c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EsEs-b5de4c9e.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/EsEs-legacy-66e0cbb9.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/first_step-05a78ca5.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ForgatPage-bd2b1b99.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ForgatPage-f710d929.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ForgatPage-legacy-30f839de.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/FrFr-29d8068d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/FrFr-legacy-d34544a5.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/gh_ee2b487a17d5_258-730a00a7.jpg"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/gift_banner-7207d19d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/gift-470bfa61.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/gov_logo-a20583c8.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/gray-a88aae3b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/hat-288c89f0.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/header-9cdc9e16.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/header-ec8bdcef.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/header-legacy-d02ea72b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/HelpPage-95f85a01.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/HelpPage-bcab4fff.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/HelpPage-legacy-0d3afe37.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_account_premium-dcf701c1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_account_team-88263561.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_android-5125e9c2.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_banner_1_2x-7456dfa1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_banner_2_2x-e5ee290a.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_banner_3_2x-161d8901.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_blank_img-f5f2d6de.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_blank_news-52af3f2c.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_cs_logo_2x-8f26911d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_cs_logo_en-d9272f34.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_cs_logo-47cda760.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_cs_logo-c7a07ade.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_default_blank_doc-e6a5bacd.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_default_blank_search-16c2753f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_default_blank_tag-a9a9fbe1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_default_blank_trashbin-3ceed8c2.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_default_qrcode-5c95bdbd.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_download-d8150637.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_edit_opacity-55f53f79.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_edit_rotate-3631ab4b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_excel_pdf-487c9649.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_filter_enhance-6093864e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_filter_enhance2-0f4e8311.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_filter_noshadow-006ecc59.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_filter_origin-6d77bd6f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_foto_pdf-3efc5b26.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_green_gift-a422e08f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_home_support_3-a5fa715c.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_home_support_4-11690630.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_iphone-2ccbefd6.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_loading_big-337cdeb1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_loading_fail-00c1de1f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_loading_small-3e29c9f8.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_login_logo-c2918a92.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_logo_cn_new-41c20bb4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_logo-5fec4d13.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_logo-99c24c07.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_logo-9b7313e5.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_mac-9abee553.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_ocr_fail-3a02fee6.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_ocr_ing-eb172924.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_pc_download_doc-050ce40e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_pc_download_ppt-dd4ba858.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_pc_download_xls-d185584f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_pdf_excel-742a42cf.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_pdf_foto-3845f3eb.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_pdf_ppt-a8316794.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_pdf_word-993e608b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_phone_show-6a5b91e8.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_ppt_pdf-a64d1ad2.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_tools_01-f4064005.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_tools_02-26c1f3bf.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_tools_03-f454310b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_tools_04-49318aa1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_tools_05-faa3237f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_tools_06-623185eb.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_vip_book-185cb669.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_vip_excel-a7d3c0fc.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_vip_functions-77c2c0e3.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_vip_id_photo-4f4af1a4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_vip_seal-e5ef6902.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_word_pdf-8dd64640.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ic_write@3x-6a12e63d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/icon-be258ddd.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image-bg-d2f7f661.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image1_c-f265d9e4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image1_e-dfed9d64.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image2_c-77a56bbf.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image2_e-be36327c.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image3_c-3f884f99.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image3_e-c8a330ec.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image4_c-996f3727.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/image4_e-a08a17f4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_alipay-35b3f04f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_bottom-0adcf1c0.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_download_bg-f6dd16fb.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_download_jpg-48dad76d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_download_pdf-a4e2cbd8.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_1-c71e38ff.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_2-ff4d27a6.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_cooperation_1-f4c5c217.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_cooperation_2-8ab37da8.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_cooperation_3-c5aaeb8f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_cooperation_4-7f53ab1b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_education_1-73cd3a76.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_education_2-4167e5c3.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_education_3-1350e9f3.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_education_4-c5daf91f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_education_5-4cdaec14.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_education_6-f6585b8f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_finance_1-4f0713c6.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_finance_2-b4cbc7d2.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_finance_3-1da6539f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_home_finance_4-10c57876.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_icon-5aee7e93.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_open-c5c5d821.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_paypal-b4ef9bba.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_receivecard_bg_top-ef60349f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_receivecard_study-e25757dc.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_receivecard_vip-54c669cc.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_receivecard_work-a2a88804.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_sharecard_pop_bg-6e2a92ab.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_sharecard_study-53748a93.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_sharecard_vip-6eb778c1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_sharecard_work-e5690759.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_toolbox_upload_ing-d77b6a77.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_unionpay-4f49ef9f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_wechat-bdd79406.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/img_wechat-ca63cb21.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/index-90d0559f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/index-98875c14.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/index-legacy-9f53383c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/InformedConsent-2aff4d44.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/InformedConsent-7f0b572b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/InformedConsent-legacy-a788221f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/InId-36e20ee0.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/InId-legacy-bd1317f0.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ink-5ae0aaee.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/IntroLanding-33cf223d.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/IntroLanding-fd130a9b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/IntroLanding-legacy-fe5f4c65.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/IntroLandingMo-7861ea07.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/IntroLandingMo-de60f1de.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/IntroLandingMo-legacy-40bafd13.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/invite-17b5aab4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ios_browser-0cba36e2.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ISO1-4c4f5899.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ISO2-387e0953.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ISO3-87f60729.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ItIt-028d7b33.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ItIt-legacy-952cc547.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/JaJp-8e6bd4da.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/JaJp-legacy-500a40e3.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/jindong-78396721.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/jishufuwu-77d9a577.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/KoKr-466ab88d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/KoKr-legacy-af47c670.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/layout-21129261.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/layout-9f15c196.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/layout-legacy-da39e436.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/left_img-2253e41e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/libs-250e5f01.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/libs-legacy-33816542.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/license_mini-99b16f06.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/license-0f47d053.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/light-c6e25982.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ListPage-79e97807.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ListPage-bf152bc7.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ListPage-legacy-46e05215.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginDialog-b5b0dccc.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginDialog-c0cc2372.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginDialog-legacy-d687bb8f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginHeader-1a6fd981.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginHeader-2fea9369.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginHeader-legacy-181d5b52.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginPage-29b2938f.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginPage-b10c991b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/LoginPage-legacy-6e3d5741.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_ch_white-ceda1068.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_ch-d1c40bde.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_cn-32ee03ef.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_cn-4c8dd57d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_cn-954a8d7b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_cs_en-a49f0048.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_cs_zh-1cd9e54b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_en_white-281fa0bf.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_en-3328d2cc.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_en-6768f693.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_en-8dc99eff.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_en-e9cd5746.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_es-65b5ea77.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_hk_280px-058b25dc.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_hk_330_72px_w-9fc5bd30.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_hk_330_72px-71a00b9b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_hk_330_72px-8f3769e9.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo_zh-e455ca91.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo-0c125174.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo-6fc50c8e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo-bea13126.gif"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo-cb61d406.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo-e3e442fa.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo1_cn-85718e98.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/logo2-4307444e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Logout-2a8f5eb1.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Logout-d01bcbe8.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Logout-legacy-ae02f8a7.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MainMorePopup-dca91760.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MainMorePopup-e6234c01.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MainMorePopup-legacy-e6f75ac7.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MainPage-da56b89d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MainPage-f928dffb.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MainPage-legacy-0d5509ba.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/mainTopSetting-110011f5.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/mainTopSetting-c285896d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/mainTopSetting-legacy-d2e916f8.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ManagerPage-60c20fbc.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ManagerPage-a028cd1b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ManagerPage-legacy-b9676286.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MessagePage-283d0df2.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MessagePage-7f502de1.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MessagePage-legacy-3754aaca.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/middle_banner-6b46cc7a.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MobileView-2262f2aa.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MobileView-376cfec8.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/MobileView-legacy-a57dc356.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/modal-076db305.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/mp_qrcode-99c108d6.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/napi-7dbc0bbe.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/napi-legacy-7366bc4e.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/NotFound-22e65ca6.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/NotFound-8190cad8.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/NotFound-legacy-431b31bb.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ocr-4d85aaf3.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ocr2-2847d965.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ocr2-e152e86f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/OpenApp-3fc8630f.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/OpenApp-fdeab847.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/OpenApp-legacy-7e759a12.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/origin-c522970d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pay_sprite-bb0c481d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/payment_sprite-a44f1e95.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PaymentPage-be016c18.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PaymentPage-fb784734.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PaymentPage-legacy-1bfd0489.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pdf-8f95ed81.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pdf.worker.min-0368b35c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pdf.worker.min-f3165c14.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pdf.worker.min-legacy-974ff309.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Delete-63f730ba.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Delete-cc5dcf8c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Delete-legacy-1b50195b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Extract-7dbf1e3f.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Extract-939b515f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Extract-legacy-d0a3af7d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Merge-0b65fced.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Merge-e07b1249.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Merge-legacy-f5168506.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Rotate-217f2953.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Rotate-72484667.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Rotate-legacy-a98a1cb4.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Sort-1ff3f4b8.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Sort-c8bc7e00.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pdf2Sort-legacy-21cd615b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/phone-c7ceecdc.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic_img-5a987b68.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic01-92adc6eb.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic01-b8703b31.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic01-ec7ae00c.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic02-4202a78a.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic02-64dd2882.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic03-17e23cc4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic03-411b55ee.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic04-0637170a.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic04-73d427ca.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic05-16a68033.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic05-2840f171.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic06-e0fe9520.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic06-e72a28b4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic07-03dbb760.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic07-aaf9e571.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic08-d2c2b205.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic10-0fdc9ed1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic11-adc2c311.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic12-1bba64e4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/pic14-48a3ab86.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pic2Pdf-cd72a23a.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pic2Pdf-d482f244.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/Pic2Pdf-legacy-789fc00c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PlPl-812cdd92.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PlPl-legacy-6c810ca1.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/polyfills-9758cb4a.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/polyfills-legacy-7f5aef89.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/portrait5-8a33cf4d.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/portrait6-641dbf54.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/portrait7-4c4bdb05.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/portrait8-fbe314f4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PremiumPage-39a0f5d3.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PremiumPage-ec5ab2b3.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PremiumPage-legacy-52c25175.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/print_en-33a12d78.mp4"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/print-7b570b00.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/print-bf8cef65.mp4"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/print-ee99c062.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/printer_pen-87cd882f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/printer-96ba7189.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/printer-d12da05f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PrinterView-42c4338f.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PrinterView-c31fbb59.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PrinterView-legacy-a6a97946.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PrivacySettings-bb4d7799.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PrivacySettings-fbe77f2c.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PrivacySettings-legacy-1fe19712.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PtBr-202d6b5d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PtBr-legacy-13beb4fa.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PtPt-433a1d98.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/PtPt-legacy-c37a9695.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/qr-code-f079bf70.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/qrcode_bg-18895652.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/qrcode-238c92f7.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QrCode-47963620.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/qrcode-4bff340c.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QrCode-c03c0e72.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QrCode-legacy-044b831f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QrLogout-9e9319d8.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QrLogout-b419df7a.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QrLogout-legacy-239cf41f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QuestionNaire-6a82412b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QuestionNaire-f7c18733.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/QuestionNaire-legacy-a0a61a36.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RecentPage-36dfbcc7.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RecentPage-cc4efaa7.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RecentPage-legacy-cf8e1be1.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RecyclerPage-5c517509.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RecyclerPage-bed643df.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RecyclerPage-legacy-cc5ce4d0.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RegisterPage-33145d70.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RegisterPage-411c94d0.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RegisterPage-legacy-04fdfa8d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/remove_shadow-5165b78c.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/rongliang-4522ff72.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RuRu-fc36a975.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/RuRu-legacy-42b3176b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sample_img_cn-f9837842.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sapi-65078bb6.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sapi-legacy-6806b591.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/scan_en-014a2e7f.mp4"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/scan-558041a4.mp4"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/scan-f7996b4b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/scan2-0897667e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/scan2-6b1ba9e1.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/SearchPage-0bd6bca5.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/SearchPage-860ad532.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/SearchPage-legacy-ecce5947.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/second_step-480d3f65.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/share_en-853297c6.mp4"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/share_icon-f13dd0d9.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/share-1079eb9c.mp4"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/share-8e49769e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/SharerPage-629dd1bc.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/SharerPage-e6491349.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/SharerPage-legacy-e1c18b74.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/shootPage-0e95a6f6.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/shootPage-23d0389d.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/shootPage-legacy-2baab145.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ShowPage-6f21f2f5.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ShowPage-79f8ca05.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ShowPage-legacy-7fcd8dbf.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/SkSk-0ee7cf36.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/SkSk-legacy-cdbab243.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sliceDownload-e315a431.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sliceDownload-legacy-687056e5.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/small_banner-9d3889b7.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/start-5a624c13.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/step1-58789058.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/step2-1a0860d9.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/super_filter-73f5ed4e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sync_en-5063329b.gif"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sync_en-d7d8ffde.gif"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sync-529f7ad2.gif"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sync-6b150365.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sync-8c41c20f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/sync-97465018.gif"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TaxOfficial-684b2020.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TaxOfficial-bd04e303.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TaxOfficial-legacy-034a7566.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/team_logo-c6f4c566.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/test-e9e5eed1.jpeg"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TestPage-0f1fb054.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TestPage-a146017c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TestPage-legacy-9ffe9009.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/third_step-0a1d9a63.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/tianmao-654e3cf0.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/tool-6ad7c76f.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/tools-c2ca0f3f.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/tools-legacy-ea715249.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/toolsBox-13bd71fc.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/toolsBox-legacy-fd233b2c.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ToolsBoxTop-17f3c965.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ToolsBoxTop-882d8676.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ToolsBoxTop-legacy-cfb71e76.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ToolsDesc-355ca6cd.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ToolsDesc-651310a8.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ToolsDesc-legacy-c2e78be6.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/top_banner-beacda8e.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TransferLanding-56e12961.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TransferLanding-dae73727.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TransferLanding-legacy-bf86fef2.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TrTr-f9b94c9b.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/TrTr-legacy-7fe3fd16.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/type-702a8201.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/uapi-36a28288.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/uapi-legacy-98ff75a3.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/user-store-a4f4557a.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/user-store-legacy-5d9ed7f4.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/vconsole.min-f1eee2e8.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/vconsole.min-legacy-3cc363b9.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/vendor-f6f18e65.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/vendor-legacy-47edb4ec.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/web_safety-ca69bb86.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/WebOcr-32cfb687.css"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/WebOcr-48bf4027.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/WebOcr-legacy-f6e46830.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/wechat_pay-a42be8a4.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/wechat_qrcode-ee5ef2fb.jpg"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/word-b8757c23.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/write_pad-913de483.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/yuangong-b3f3217a.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ZhCn-fcf48fbe.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ZhCn-legacy-da736608.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/zhengjiansaomiao-d0b4958b.png"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ZhTw-30444415.js"},{"revision":null,"url":"https://static-cdn.camscanner.com/camscanner-toc/static/ZhTw-legacy-ef86b7a5.js"},{"revision":"1e84fadc071a1d7c8c54611e177c4123","url":"icon/logo_192.png"},{"revision":"fc0159ab569eb2e0d96c657ce9985a36","url":"icon/logo_144.png"},{"revision":"3d3d9541e90df2259acb88b01821b940","url":"icon/logo_96.png"},{"revision":"27f00716c930828ab73c1b6c191b2063","url":"icon/logo_72.png"},{"revision":"f500fb8eb3b74a586455bc8cb47ac14f","url":"icon/logo_48.png"},{"revision":"6cb6ad49d6add75140af3e63405cf0a4","url":"icon/logo_36.png"},{"revision":"2a4f41ecced047b15074034ac7dd9dc3","url":"manifest.webmanifest"}]);
const he = re("/login"), ue = new E(he, {
  allowlist: le
});
T(ue);
self.addEventListener("message", (a) => {
  a.data && a.data.type === "SKIP_WAITING" && self.skipWaiting();
});
