// builds a multi section reports pdf on the client from the fetched report data.
// jspdf is lazy loaded so it only ships when someone actually exports.
export async function exportReportsPdf({ schoolName, term, overview, enrolment, attendance, exams, fees }) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const green = [21, 128, 61];
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(...green);
  doc.text(`${schoolName || "School"} reports`, 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(
    `${term ? `Term: ${term} · ` : ""}Generated ${new Date().toISOString().slice(0, 10)}`,
    14,
    y
  );
  y += 8;

  const section = (title, head, body) => {
    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      headStyles: { fillColor: green },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {},
    });
    y = doc.lastAutoTable.finalY + 8;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(title, 14, y - 4);
  };

  if (overview) {
    section("Overview", ["Metric", "Value"], [
      ["Enrolled students", String(overview.students ?? "-")],
      ["Teachers", String(overview.teachers ?? "-")],
      ["Parents", String(overview.parents ?? "-")],
      ["Classes", String(overview.classes ?? "-")],
      ["Active term", overview.activeTerm ? `${overview.activeTerm.name} (${overview.activeTerm.academicYear})` : "-"],
      ["Fee collection rate", overview.feeCollectionRate != null ? `${overview.feeCollectionRate}%` : "-"],
      ["Outstanding", String(overview.outstanding ?? "-")],
    ]);
  }

  if (enrolment?.perClass?.length) {
    section("Enrolment by class", ["Class", "Enrolled", "Capacity", "Graduated", "Withdrawn"],
      enrolment.perClass.map((c) => [
        `${c.name} ${c.section || ""}`.trim(), String(c.enrolled), String(c.capacity), String(c.graduated), String(c.withdrawn),
      ]));
  }

  if (attendance?.perClass?.length) {
    section("Attendance rate by class", ["Class", "Present", "Absent", "Late", "Excused", "Rate"],
      attendance.perClass.map((c) => [
        c.className, String(c.Present), String(c.Absent), String(c.Late), String(c.Excused), c.rate != null ? `${c.rate}%` : "-",
      ]));
  }

  if (exams?.perSubject?.length) {
    section("Exam performance by subject", ["Subject", "Average %", "Marks counted"],
      exams.perSubject.map((s) => [s.name, `${s.averagePercentage}%`, String(s.marksCounted)]));
  }

  if (fees?.perClass?.length) {
    section("Fees by class", ["Class", "Billed", "Paid", "Outstanding"],
      fees.perClass.map((c) => [`${c.className} ${c.section || ""}`.trim(), String(c.billed), String(c.paid), String(c.outstanding)]));
  }

  doc.save(`reports-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default exportReportsPdf;
