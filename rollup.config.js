import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/manage-players.ts",
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    entryFileNames: "[name].js",
    chunkFileNames: "[name]-[hash].js",
    extend: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      outputToFilesystem: true,
    }),
  ],
};
