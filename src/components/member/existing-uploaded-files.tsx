"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UploadedFileItem {
  id: string;
  documentType: "selfie" | "document";
  fileName: string;
  uploadedAt: string;
  previewUrl: string | null;
  mimeType: string;
}

export function ExistingUploadedFiles({ items }: { items: UploadedFileItem[] }) {
  const router = useRouter();
  const [busyType, setBusyType] = useState<"selfie" | "document" | null>(null);

  async function removeFile(documentType: "selfie" | "document") {
    setBusyType(documentType);
    const response = await fetch(`/api/member/uploads/${documentType}`, { method: "DELETE" });
    setBusyType(null);
    if (response.ok) router.refresh();
  }

  function replaceFile(documentType: "selfie" | "document") {
    document.getElementById(documentType)?.click();
  }

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-[22px] border border-[var(--border)] bg-white p-4">
          {item.previewUrl ? (
            <div className="relative mb-4 aspect-square max-w-[220px] overflow-hidden rounded-[18px] bg-[#eef2fb] sm:aspect-[4/5]">
              <Image
                src={item.previewUrl}
                alt={`${item.documentType} preview`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="mb-4 max-w-[220px] rounded-[18px] border border-[var(--border)] bg-[#eef2fb] px-4 py-5 text-sm text-[#24345f]">
              <p className="font-semibold">Document selected</p>
              <p className="mt-1 break-all text-[var(--muted)]">{item.fileName}</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold capitalize">{item.documentType}</p>
          </div>
          <p className="mt-2 text-sm text-[var(--foreground)]">{item.fileName}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Uploaded {item.uploadedAt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => replaceFile(item.documentType)}
              className="inline-flex rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb]"
            >
              Replace file
            </button>
            <button
              type="button"
              disabled={busyType === item.documentType}
              onClick={() => removeFile(item.documentType)}
              className="inline-flex rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[#6f84ba] hover:bg-[#eef2fb] disabled:opacity-60"
            >
              {busyType === item.documentType ? "Removing..." : "Remove file"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
