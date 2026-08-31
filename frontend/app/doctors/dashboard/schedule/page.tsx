import { redirect } from "next/navigation";

export default function DoctorScheduleRedirect() {
  redirect("/doctors/dashboard/schedule");
}
