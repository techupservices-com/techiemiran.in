import type { MemberDocument, MemberProfile, VerificationChecklist } from "@/lib/types";

export function computeVerification(
  profile: MemberProfile,
  documents: MemberDocument[],
): VerificationChecklist {
  const selfieUploaded = documents.some((document) => document.documentGroup === "selfie");
  const documentUploaded = true;
  const profileConfirmed = Boolean(
    profile.membershipId &&
      profile.fullName &&
      profile.email &&
      profile.currentMobile,
  );
  const completed = profileConfirmed && profile.mobileVerified && profile.emailVerified && selfieUploaded;

  return {
    profileConfirmed,
    mobileVerified: profile.mobileVerified,
    emailVerified: profile.emailVerified,
    selfieUploaded,
    documentUploaded,
    completed,
  };
}
