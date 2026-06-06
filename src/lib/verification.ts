import type { MemberDocument, MemberProfile, VerificationChecklist } from "@/lib/types";

export function computeVerification(
  profile: MemberProfile,
  documents: MemberDocument[],
): VerificationChecklist {
  const selfieUploaded = documents.some((document) => document.documentType === "selfie");
  const documentUploaded = documents.some(
    (document) => document.documentType === "document",
  );
  const profileConfirmed = Boolean(
    profile.membershipId &&
      profile.fullName &&
      profile.email &&
      profile.currentMobile &&
      profile.address1 &&
      profile.city &&
      profile.pincode,
  );
  const completed =
    profileConfirmed && profile.mobileVerified && profile.emailVerified && selfieUploaded && documentUploaded;

  return {
    profileConfirmed,
    mobileVerified: profile.mobileVerified,
    emailVerified: profile.emailVerified,
    selfieUploaded,
    documentUploaded,
    completed,
  };
}
