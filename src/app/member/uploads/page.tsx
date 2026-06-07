import { UploadForm } from "@/components/member/upload-form";
import { StatusChip } from "@/components/shared/status-chip";
import { getMemberSession } from "@/lib/auth";
import { getMemberById, getMemberProfilePhotoUrl, listDocuments } from "@/lib/data";

export default async function UploadsPage() {
  const session = await getMemberSession();
  const member = session ? await getMemberById(session.subject) : null;
  const documents = member ? await listDocuments(member.id) : [];
  const selfie = documents.find((document) => document.documentGroup === "selfie") ?? null;
  const selfiePreviewUrl = member ? await getMemberProfilePhotoUrl(member.id, member.photoUrl) : null;

  return (
    <section className="grid gap-4">
      <div className="soft-card rounded-[28px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#3c589e]">Uploads step</p>
            <h2 className="mt-2 text-2xl font-semibold">Upload or replace your selfie</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">This step is complete once your selfie is uploaded successfully to your member record.</p>
          </div>
          <StatusChip label={member?.verification.selfieUploaded ? "Completed" : "Pending"} tone={member?.verification.selfieUploaded ? "success" : "warning"} />
        </div>
      </div>

      <div className="soft-card rounded-[28px] p-6">
        <UploadForm
          selfie={
            selfie
              ? {
                  id: selfie.id,
                  fileName: selfie.fileName,
                  previewUrl: selfiePreviewUrl,
                }
              : null
          }
        />
      </div>
    </section>
  );
}
