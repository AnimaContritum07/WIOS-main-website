import { UTApi } from "uploadthing/server";
import { db } from "@/config/firebase";
import { getEventByIdOrSlug } from "@/modules/events";

export async function deleteFilesFromUploadThing(
  fileKeys: string | string[],
): Promise<{ success: boolean; error?: string }> {
  const keys = Array.isArray(fileKeys) ? fileKeys : [fileKeys];
  const validKeys = keys.filter(
    (k) => typeof k === "string" && k.trim().length > 0 && !k.startsWith("seed-") && k !== "banner",
  );

  if (validKeys.length === 0) {
    return { success: true };
  }

  try {
    const utapi = new UTApi();
    await utapi.deleteFiles(validKeys);
    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn("UploadThing deleteFiles warning:", errMsg);
    return { success: false, error: errMsg };
  }
}

export async function deleteEventImage(
  key: string,
  eventIdOrSlug?: string,
): Promise<{ success: boolean; error?: string }> {
  // 1. Remove from UploadThing
  const utResult = await deleteFilesFromUploadThing(key);

  // 2. If eventId is provided, also remove the image from Firestore document
  if (eventIdOrSlug) {
    try {
      const event = await getEventByIdOrSlug(eventIdOrSlug);
      if (event) {
        const updatedImages = (event.images || []).filter((img) => img.key !== key);
        await db.collection("events").doc(event.id).set(
          {
            images: updatedImages,
          },
          { merge: true },
        );
      }
    } catch (err) {
      console.warn("Error removing image from Firestore event doc:", err);
    }
  }

  return utResult;
}
