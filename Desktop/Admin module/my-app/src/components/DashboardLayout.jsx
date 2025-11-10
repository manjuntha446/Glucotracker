import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 p-6 bg-background overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
