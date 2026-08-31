import { redirect } from "next/navigation";

export default function ScheduleRedirect() {
  redirect("/doctors/dashboard/schedule");
}
