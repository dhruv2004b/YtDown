import NodeCache from "node-cache";

export const videoCache = new NodeCache({
  stdTTL: 1800, // 30 minutes
});