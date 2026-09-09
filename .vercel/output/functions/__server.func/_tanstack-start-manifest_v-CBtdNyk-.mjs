//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-CBtdNyk-.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: [
			"/",
			"/deporte/$sport",
			"/equipo/$slug",
			"/partido/$id"
		],
		preloads: ["/assets/index-CUc14FUm.js", "/assets/sports-rw3dZjjs.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-CUc14FUm.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-YrUPwk2u.js",
			"/assets/favorites-Bxhx-h5u.js",
			"/assets/match-card-CUpzNFG-.js"
		]
	},
	"/deporte/$sport": {
		filePath: "/workspace/src/routes/deporte.$sport.tsx",
		children: void 0,
		preloads: [
			"/assets/deporte._sport-oEHR3951.js",
			"/assets/match-card-CUpzNFG-.js",
			"/assets/standings-table-CMwu-tFl.js"
		]
	},
	"/equipo/$slug": {
		filePath: "/workspace/src/routes/equipo.$slug.tsx",
		children: void 0,
		preloads: [
			"/assets/equipo._slug-BIbuqDc4.js",
			"/assets/favorites-Bxhx-h5u.js",
			"/assets/match-card-CUpzNFG-.js",
			"/assets/standings-table-CMwu-tFl.js"
		]
	},
	"/partido/$id": {
		filePath: "/workspace/src/routes/partido.$id.tsx",
		children: void 0,
		preloads: ["/assets/partido._id-Bbs44kdF.js", "/assets/match-card-CUpzNFG-.js"]
	}
} });
//#endregion
export { tsrStartManifest };
