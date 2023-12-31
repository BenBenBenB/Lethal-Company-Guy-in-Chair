module.exports = function (wallaby) {
  return {
    files: ["src/**/*.ts", "!src/**/*.test.ts"],

    tests: ["src/**/*.test.ts"],

    env: {
      type: "browser",
      //runner: 'node'
    },

    testFramework: "jest",

    compilers: {},

    debug: true,
  };
};
