import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "@/modules/upload/upload.router";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
