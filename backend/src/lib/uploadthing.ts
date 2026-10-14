import { genUploader } from "uploadthing/client";
import type { OurFileRouter } from "@/modules/upload/upload.router";

export const { uploadFiles } = genUploader<OurFileRouter>({
  package: "uploadthing",
});
