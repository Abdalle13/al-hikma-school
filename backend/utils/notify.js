import Notification from "../models/notificationModel.js";

// creates a simulated notification for each guardian of a student.
// nothing is really sent, see the readme. returns the created rows.
export async function notifyGuardians(student, { channel = "whatsapp", content, relatedTo, relatedId, meta } = {}) {
  const guardians = student.guardians || [];
  if (!guardians.length || !content) return [];

  const rows = guardians.map((g) => ({
    to: g.user,
    channel,
    content,
    relatedTo,
    relatedId,
    status: "sent",
    meta: { studentName: student.name, admissionNo: student.admissionNo, ...(meta || {}) },
  }));

  return Notification.insertMany(rows);
}

export default notifyGuardians;
