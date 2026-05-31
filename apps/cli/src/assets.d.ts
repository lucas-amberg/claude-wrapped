// esbuild/tsup binary loader turns font imports into Uint8Array at build time.
declare module "*.ttf" {
  const data: Uint8Array;
  export default data;
}
declare module "*.otf" {
  const data: Uint8Array;
  export default data;
}
