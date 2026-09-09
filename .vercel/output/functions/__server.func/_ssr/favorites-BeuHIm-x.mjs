import { i as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/favorites-BeuHIm-x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var useFavorites = create()(persist((set) => ({
	ids: [],
	toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] }))
}), { name: "melilla-directo-favs" }));
function useFavorite(id) {
	const ids = useFavorites((s) => s.ids);
	const toggle = useFavorites((s) => s.toggle);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	return {
		fav: ready && ids.includes(id),
		toggle
	};
}
function useFavoriteIds() {
	const ids = useFavorites((s) => s.ids);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	return ready ? ids : [];
}
//#endregion
export { useFavoriteIds as n, useFavorite as t };
