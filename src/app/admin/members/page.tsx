import { MemberDirectory } from "@/components/admin/member-directory";
import { listMembersWithVerification } from "@/lib/mock-store";

export default function AdminMembersPage() {
  return <MemberDirectory members={listMembersWithVerification()} />;
}
