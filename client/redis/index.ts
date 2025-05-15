import { createClient } from "redis";

const Redisclient = createClient(); // default: localhost:6379

Redisclient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  console.log("connecting");
  await Redisclient.connect();
})();

export default Redisclient;
