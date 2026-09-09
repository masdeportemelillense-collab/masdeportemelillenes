import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/get-snapshot-BpkmXeE8.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getLiveSnapshot_createServerFn_handler = createServerRpc({
	id: "7ef13e79095abd923abbf3e201d16e7e368a20b9d90fc541064e956cfc3fb71c",
	name: "getLiveSnapshot",
	filename: "src/lib/api/get-snapshot.ts"
}, (opts) => getLiveSnapshot.__executeServer(opts));
var getLiveSnapshot = createServerFn({ method: "GET" }).handler(getLiveSnapshot_createServerFn_handler, async () => {
	const { fetchLiveSnapshot } = await import("./thesportsdb.server-GCRC2n65.mjs");
	return fetchLiveSnapshot();
});
//#endregion
export { getLiveSnapshot_createServerFn_handler };
