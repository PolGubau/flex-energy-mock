import { readDemoState } from "./store";

// A small valid PDF generated entirely in memory; no PDF service or library.
export function createDemoPdf(id: string): Blob {
  const transaction = readDemoState().transactions.find(
    (tx) => tx.exportId === id,
  );
  const lines = [
    "FlexEnergy - DEMO DOCUMENT",
    "Simulated data only. Not a real invoice or payment receipt.",
    `Document: ${id}`,
    ...(transaction
      ? [
          `Contract: ${transaction.buContractID}`,
          `Description: ${transaction.description}`,
          `Amount: CHF ${transaction.amount.toFixed(2)}`,
          `Date: ${transaction.createdAt}`,
        ]
      : ["Local demo account statement"]),
  ];
  const escapePdfText = (value: string) =>
    value.replace(/[^\x20-\x7e]/g, "?").replace(/([\\()])/g, "\\$1");
  const stream = `BT /F1 12 Tf 50 790 Td ${lines
    .map(
      (line, index) => `${index ? "0 -24 Td " : ""}(${escapePdfText(line)}) Tj`,
    )
    .join("\n")} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("")}`;
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Blob([pdf], { type: "application/pdf" });
}
