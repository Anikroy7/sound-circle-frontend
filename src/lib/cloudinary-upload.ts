import type { UploadTicket } from "@/types/profile";

/**
 * Where one uploader's files go: a ticket for each upload, then save or remove the file. Each call
 * answers with the owner's whole record (the profile, or the band), which the uploader hands back.
 */
export interface UploadEndpoints<R> {
  ticket: () => Promise<UploadTicket>;
  attach: (publicId: string, fileName: string) => Promise<R>;
  remove: (id: number) => Promise<R>;
}

/** Cloudinary refused the upload; `message` is its own explanation (never contains a secret). */
export class UploadError extends Error {}

/**
 * Sends one file straight from the browser to Cloudinary with a ticket the API signed. XHR rather
 * than `fetch` because only XHR reports upload progress. Resolves with the stored `public_id`.
 *
 * The ticket's fields must go back unchanged: they are what the signature covers.
 */
export function uploadToCloudinary(ticket: UploadTicket, file: File, onProgress: (fraction: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    Object.entries(ticket.fields).forEach(([key, value]) => form.append(key, value));
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", ticket.upload_url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let body: { public_id?: string; error?: { message?: string } } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // Not JSON: fall through to the generic failure below.
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.public_id) return resolve(body.public_id);
      if (xhr.status === 401 || xhr.status === 403) {
        // The server's Cloudinary credentials are wrong: nothing the musician can fix, so say so plainly.
        console.error(`Cloudinary refused the upload (${xhr.status}): ${body.error?.message ?? xhr.responseText}`);
        return reject(new UploadError("file uploads aren't set up correctly on our side yet. Please try again later"));
      }
      reject(new UploadError(body.error?.message ?? `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new UploadError("The upload was interrupted. Check your connection and try again"));
    xhr.send(form);
  });
}

/** A square Cloudinary thumbnail (`c_fill`, auto format and quality) instead of the full-size original. */
export const cloudinaryThumbnail = (url: string, size = 320): string => url.replace("/upload/", `/upload/c_fill,w_${size},h_${size},q_auto,f_auto/`);
