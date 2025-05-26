import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
