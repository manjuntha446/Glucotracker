import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  Star,
  Store,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", to: "/customer", icon: Users },
  { title: "Bookings", to: "/booking", icon: Calendar },
  { title: "Services", to: "/index", icon: Package },
  { title: "Reviews", to: "/review", icon: Star },
  { title: "Subscriptions", to: "/subscription", icon: Bell },
  { title: "Vendors", to: "/vendor", icon: Store },
];

export function AppSidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
                <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              {isOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sidebar-foreground">
                    Admin Portal
                  </span>
                  <span className="text-xs text-sidebar-foreground/60">
                    Service Platform
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {isOpen && (
              <p className="px-3 py-2 text-xs font-medium text-sidebar-foreground/60">
                Main Menu
              </p>
            )}
            {navItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`
                }
                title={!isOpen ? item.title : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {isOpen && <span className="text-sm">{item.title}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title={!isOpen ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {isOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
