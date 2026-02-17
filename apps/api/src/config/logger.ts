import { Logestic } from "logestic";

export const logger = new Logestic({
  showLevel: true,
  httpLogging: true,
  explicitLogging: true,
}).use(["method", "path", "status", "duration", "ip", "time"]);
