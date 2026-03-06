import { redirect } from "next/navigation";

export default function Home() {
  // Simple redirect to tracking or admin.
  // Custom landing page can be added here if needed in the future.
  redirect("/admin");
}
