"use client";

export function VerificationCompleteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#21304f]/70 px-4">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-8 text-center shadow-[0_30px_80px_rgba(33,48,79,0.28)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eef2fb] text-3xl">
          ✓
        </div>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-[#3c589e]">
          Verification completed
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          Congratulations!
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)] md:text-base">
          Your verification is now completed. Thank you for updating your details and helping us keep the member records accurate.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 rounded-2xl bg-[#3c589e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2f467e]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
