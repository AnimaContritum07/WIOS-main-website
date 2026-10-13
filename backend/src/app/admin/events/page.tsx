import EventsAdminList from "@/components/EventsAdminList";
import FieldKeysPanel from "@/components/FieldKeysPanel";
import AdminsPanel from "@/components/AdminsPanel";

export default function AdminEventsPage() {
  return (
    <main className="min-h-screen bg-white px-6">
      <EventsAdminList />
      <div className="mx-auto w-full max-w-3xl border-t border-black/10" />
      <FieldKeysPanel />
      <div className="mx-auto w-full max-w-3xl border-t border-black/10" />
      <AdminsPanel />
    </main>
  );
}
