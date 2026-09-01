import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { AttendanceMarker } from "../components/ui/AttendanceMarker.jsx";
import api, { apiError } from "../utils/api.js";
import toast from "react-hot-toast";

export default function TeacherAttendancePage() {
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
        setClasses([...map.values()].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((err) => {
        toast.error(apiError(err, "Could not load your classes"));
        setClasses([]);
      });
  }, [me._id]);

  return (
    <div>
      <PageHeader title="Attendance" description="Mark the daily register for your classes." />
      {classes === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          title="No classes assigned"
          description="You are not a class teacher and have no teaching assignments yet. Ask an admin to set this up."
        />
      ) : (
        <AttendanceMarker classes={classes} />
      )}
    </div>
  );
}
