/**
 * PIVYON Firecrawl Gateway backend integration. This file is intentionally not imported by UI code.
 * Enable only in trusted server-side code, after gateway rollout and secret provisioning.
 * No Firecrawl or app tokens belong in a frontend bundle.
 */
export function createPivyonResearchClient({
  gatewayUrl = process.env.PIVYON_FIRECRAWL_GATEWAY_URL,
  appId = process.env.PIVYON_FIRECRAWL_APP_ID,
  appToken = process.env.PIVYON_FIRECRAWL_APP_TOKEN
} = {}) {
  if (typeof window !== "undefined") throw new Error("PIVYON research SDK is server-only");
  if (!gatewayUrl || !appId || !appToken) throw new Error("Missing PIVYON gateway configuration");
  const base = new URL(gatewayUrl);
  if (base.protocol !== "https:" && !(base.protocol === "http:" && base.hostname === "localhost")) throw new Error("HTTPS is required");
  const request = async (path, payload) => {
    const response = await fetch(new URL(path, base), {
      method: payload === undefined ? "GET" : "POST",
      headers: { authorization: "Bearer " + appToken, "x-pivyon-app": appId, "content-type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: AbortSignal.timeout(28000)
    });
    const data = await response.json().catch(() => ({error: "Invalid JSON"}));
    if (!response.ok) throw new Error("PIVYON gateway " + response.status + ": " + (data.error || "Unknown error"));
    return data;
  };
  return Object.freeze({
    search: (query,opts={})=>request("/v1/search",{...opts,query}),
    scrape: (url,opts={})=>request("/v1/scrape",{...opts,url}),
    map: (url,opts={})=>request("/v1/map",{...opts,url}),
    crawl: (url,opts={})=>request("/v1/crawl",{...opts,url}),
    agent: (prompt,opts={})=>request("/v1/agent",{...opts,prompt}),
    jobStatus: (kind,id,sig)=>{
      if (!["crawl","agent"].includes(kind)||!/^[A-Za-z0-9-]{1,100}$/.test(id)||!sig) throw new Error("Invalid job reference");
      return request("/v1/jobs/"+kind+"/"+id+"?sig="+encodeURIComponent(sig));
    }
  });
}
