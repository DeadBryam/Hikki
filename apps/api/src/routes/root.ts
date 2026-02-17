import { Elysia } from "elysia";
import { logesticPlugin } from "@/config/plugins/generic";
import type { BaseContext } from "./../types/context";

const rootRoute = new Elysia().use(logesticPlugin).get(
  "/",
  ({ logestic }: BaseContext) => {
    logestic.info("Root route accessed");
    return "Welcome to Hikki AI Assistant!";
  },
  {
    detail: {
      tags: ["App"],
      description: "Welcome endpoint",
    },
  }
);

export { rootRoute };
