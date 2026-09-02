import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { AnnouncementsView } from "../components/ui/AnnouncementsView.jsx";
import api from "../utils/api.js";

export default function TeacherAnnouncementsPage() {
  const me = useSelector((s) => s.auth.user);
  const [classes, setClasses] = useState(null);

  useEffect(() => {
    api
      .get(`/staff/${me._id}`)
      .then(({ data }) => {
        const map = new Map();
        (data.classTeacherOf || []).forEach((c) => map.set(c._id, c));
        (data.assignments || []).forEach((a) => {
          if (a.schoolClass) map.set(a.schoolClass._id, a.schoolClass);
        });
        setClasses([...map.values()]);
      })
      .catch(() => setClasses([]));
  }, [me._id]);

  return (
    <div>
      <PageHeader title="Announcements" description="Post a message to a class you teach." />
      {classes === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : (
        <AnnouncementsView canPostAll={false} classOptions={classes} />
      )}
    </div>
  );
}
