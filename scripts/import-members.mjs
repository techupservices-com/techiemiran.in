import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const source = process.argv[2] ?? "C:/Users/Miran/Downloads/pcl_elections.xlsx";
const output = process.argv[3] ?? path.resolve("./tmp/import-members.json");

const workbook = xlsx.readFile(source);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

function normalizeMobile(value) {
  return String(value).replace(/\D/g, "").slice(-10);
}

const transformed = rows.map((row) => ({
  membership_id: String(row["Member ID"] ?? "").trim(),
  prefix: String(row["Member Prefix"] ?? "").trim(),
  full_name: String(row["Member Name"] ?? "").trim(),
  member_type: String(row["Member Type"] ?? "").trim(),
  current_mobile: normalizeMobile(row["Mobile No."] ?? ""),
  email: String(row["Email"] ?? "").trim(),
  status: String(row["Status"] ?? "").trim(),
  address1: String(row["Address1"] ?? "").trim(),
  address2: String(row["Address2"] ?? "").trim(),
  address3: String(row["Address3"] ?? "").trim(),
  city: String(row["City"] ?? "").trim(),
  pincode: String(row["Pincode"] ?? "").replace(/\.0$/, ""),
  photo_url: String(row["Photo"] ?? "").trim() || null,
}));

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(transformed, null, 2));
console.log(`Imported ${transformed.length} members to ${output}`);
