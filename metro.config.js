const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

const originalResolver = config.resolver.resolveRequest;

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName.startsWith("zod/v4/")) {
      const subPath = moduleName.replace("zod/", "");
      const filePath = path.resolve(__dirname, `node_modules/zod/${subPath}/index.js`);
      return { filePath, type: "sourceFile" };
    }

    if (moduleName === "@hookform/resolvers") {
      return {
        filePath: path.resolve(__dirname, "node_modules/@hookform/resolvers/dist/resolvers.mjs"),
        type: "sourceFile",
      };
    }

    if (originalResolver) {
      return originalResolver(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativewind(config);
