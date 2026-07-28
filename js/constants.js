const params = new URLSearchParams(window.location.search);
export const PERFILES = ["riel", "chambrana", "traslape", "zoclo", "cerco"];
export const LARGO_PERFIL = 6.1; // Largo de perfil en m
export const CACHE_KEY = "materiales";
export const MODE_DEV = params.get("dev") === "true";
