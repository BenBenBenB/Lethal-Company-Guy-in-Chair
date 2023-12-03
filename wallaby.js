module.exports = function (wallaby) {
  return {
    files: ["js/**/*.js", "!js/**/*.test.js"],

    tests: ["js/**/*.test.js"],

    env: {
      type: "browser",
      //runner: 'node'
    },

    testFramework: "jest",

    compilers: {},

    debug: true,
  };
};
