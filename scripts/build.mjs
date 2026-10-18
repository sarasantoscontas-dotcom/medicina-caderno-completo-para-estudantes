import { mkdir, cp, rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const path of ["index.html", "404.html", "assets", "favicon.ico", "_redirects"]) await cp(path, `dist/${path}`, { recursive: true });
console.log("Site copiado para dist/");
