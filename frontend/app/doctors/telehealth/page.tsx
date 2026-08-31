import { redirect } from "next/navigation";

export default function TelehealthRedirect() {
  redirect("/doctors/dashboard/telehealth");
}
