import { UploadForm } from "@/components/member/upload-form";

export default function UploadsPage() {
  return (
    <section className="soft-card rounded-[28px] p-6">
      <h2 className="text-2xl font-semibold">Upload selfie and supporting document</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">In production, these files will be stored in Supabase Storage private buckets. This build keeps the upload flow and metadata handling ready for that handoff.</p>
      <div className="mt-6">
        <UploadForm />
      </div>
    </section>
  );
}
