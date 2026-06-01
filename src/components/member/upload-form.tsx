"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export function UploadForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selfieFileName, setSelfieFileName] = useState("No file chosen");
  const [documentFileName, setDocumentFileName] = useState("No file chosen");
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [documentIsImage, setDocumentIsImage] = useState(false);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  function clearSelfie(input: HTMLInputElement | null) {
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    if (input) input.value = "";
    setSelfiePreviewUrl(null);
    setSelfieFileName("No file chosen");
  }

  function clearDocument(input: HTMLInputElement | null) {
    if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
    if (input) input.value = "";
    setDocumentPreviewUrl(null);
    setDocumentFileName("No file chosen");
    setDocumentIsImage(false);
  }

  function resetPreviews() {
    clearSelfie(selfieInputRef.current);
    clearDocument(documentInputRef.current);
  }

  async function compressImage(file: File) {
    const imageUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Unable to process the selected image."));
        img.src = imageUrl;
      });

      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to prepare image upload.");
      }

      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
      });

      if (!blob) {
        throw new Error("Unable to compress the selected image.");
      }

      return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selfieFile = selfieInputRef.current?.files?.[0] ?? null;
    const documentFile = documentInputRef.current?.files?.[0] ?? null;

    if (!selfieFile || !documentFile) {
      setMessage("Please choose both the selfie photo and the supporting document before uploading.");
      return;
    }

    setIsUploading(true);
    setMessage("Uploading...");

    try {
      const compressedSelfie = await compressImage(selfieFile);
      const preparedDocument = documentFile.type.startsWith("image/")
        ? await compressImage(documentFile)
        : documentFile;

      if (compressedSelfie.size + preparedDocument.size > MAX_UPLOAD_BYTES) {
        setMessage("Selected files are too large. Please use smaller images or a lighter PDF document.");
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("selfie", compressedSelfie);
      formData.append("document", preparedDocument);

      const response = await fetch("/api/member/uploads", {
        method: "POST",
        body: formData,
      });
      const raw = await response.text();
      let payload: { message?: string; error?: string } = {};

      try {
        payload = JSON.parse(raw);
      } catch {
        payload = {
          error: response.status === 413
            ? "Selected files are too large for upload. Please choose smaller files and try again."
            : "Upload failed. Please try again.",
        };
      }

      setMessage(response.ok ? payload.message ?? "Files uploaded successfully." : payload.error ?? "Upload failed.");
      if (response.ok) {
        setSelfieFileName("No file chosen");
        setDocumentFileName("No file chosen");
        resetPreviews();
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
        Upload one clear selfie and one supporting document. Both are required before your membership can be marked verified.
      </div>
      <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
        Selfie photo
        <input
          type="text"
          value={selfieFileName}
          readOnly
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)]"
        />
        <input
          id="selfie"
          type="file"
          name="selfie"
          ref={selfieInputRef}
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setSelfieFileName(file?.name ?? "No file chosen");
            if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
            setSelfiePreviewUrl(file ? URL.createObjectURL(file) : null);
          }}
        />
        <label htmlFor="selfie" className="inline-flex w-fit rounded-2xl bg-[#3c589e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f467e]">
          Choose file
        </label>
        {selfiePreviewUrl ? (
          <div className="mt-2 flex max-w-[220px] flex-col gap-3">
            <div className="relative aspect-square overflow-hidden rounded-[22px] border border-[var(--border)] bg-[#eef2fb] sm:aspect-[4/5]">
              <Image src={selfiePreviewUrl} alt="Selected selfie preview" fill unoptimized className="object-cover" />
            </div>
            <div className="flex flex-wrap gap-2">
              <label htmlFor="selfie" className="inline-flex w-fit rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]">
                Replace file
              </label>
              <button
                type="button"
                onClick={() => clearSelfie(selfieInputRef.current)}
                className="inline-flex w-fit rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]"
              >
                Remove file
              </button>
            </div>
          </div>
        ) : null}
      </label>
      <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
        Supporting document
        <input
          type="text"
          value={documentFileName}
          readOnly
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)]"
        />
        <input
          id="document"
          type="file"
          name="document"
          ref={documentInputRef}
          accept="image/*,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setDocumentFileName(file?.name ?? "No file chosen");
            if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
            if (file) {
              const isImage = file.type.startsWith("image/");
              setDocumentIsImage(isImage);
              setDocumentPreviewUrl(URL.createObjectURL(file));
            } else {
              setDocumentIsImage(false);
              setDocumentPreviewUrl(null);
            }
          }}
        />
        <label htmlFor="document" className="inline-flex w-fit rounded-2xl bg-[#3c589e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f467e]">
          Choose file
        </label>
        {documentPreviewUrl ? (
          documentIsImage ? (
            <div className="mt-2 flex max-w-[220px] flex-col gap-3">
              <div className="relative aspect-square overflow-hidden rounded-[22px] border border-[var(--border)] bg-[#eef2fb] sm:aspect-[4/5]">
                <Image src={documentPreviewUrl} alt="Selected supporting document preview" fill unoptimized className="object-cover" />
              </div>
              <div className="flex flex-wrap gap-2">
                <label htmlFor="document" className="inline-flex w-fit rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]">
                  Replace file
                </label>
                <button
                  type="button"
                  onClick={() => clearDocument(documentInputRef.current)}
                  className="inline-flex w-fit rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]"
                >
                  Remove file
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex max-w-[220px] flex-col gap-3">
              <div className="rounded-[22px] border border-[var(--border)] bg-[#eef2fb] px-4 py-5 text-sm text-[#24345f]">
                <p className="font-semibold">Document selected</p>
                <p className="mt-1 break-all text-[var(--muted)]">{documentFileName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label htmlFor="document" className="inline-flex w-fit rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]">
                  Replace file
                </label>
                <button
                  type="button"
                  onClick={() => clearDocument(documentInputRef.current)}
                  className="inline-flex w-fit rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]"
                >
                  Remove file
                </button>
              </div>
            </div>
          )
        ) : null}
      </label>
      <div className="md:col-span-2 flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
        <button disabled={isUploading} className="rounded-2xl bg-[#3c589e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f467e] disabled:cursor-not-allowed disabled:opacity-60">
          {isUploading ? "Uploading..." : "Upload files"}
        </button>
        <p
          className={`text-sm md:text-right ${
            message && !message.toLowerCase().includes("upload")
              ? "font-semibold text-red-600"
              : "text-[var(--muted)]"
          }`}
        >
          {message ?? "Accepted formats: images for selfie, images or PDF for supporting document."}
        </p>
      </div>
    </form>
  );
}
