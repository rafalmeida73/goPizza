module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          extendions: [
            ".ts",
            ".tsx",
            ".js",
            ".json"
          ],
          alias:{
            "@components" : "./src/components",
            "@screens": "./src/screens",
            "@assets": "./src/assets",
            "@hooks": "./src/hooks",
          }
        }
    ]
    ]
  };
};
