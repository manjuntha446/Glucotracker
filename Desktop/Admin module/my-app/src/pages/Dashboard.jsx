import { StatCard } from "@/components/StatCard";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  UserCheck,
  CreditCard,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "12,458",
      icon: Users,
      trend: { value: "12.5%", isPositive: true },
    },
    {
      title: "Active Vendors",
      value: "842",
      icon: UserCheck,
      trend: { value: "8.2%", isPositive: true },
    },
    {
      title: "Active Packs",
      value: "5,234",
      icon: CreditCard,
      trend: { value: "3.1%", isPositive: false },
    },
    {
      title: "Live Jobs",
      value: "127",
      icon: Calendar,
      description: "Currently active",
    },
  ];

  const recentBookings = [
    {
      id: 1,
      customer: "Manjuntha",
      service: "Painting",
      vendor: "CleanPro",
      status: "In Progress",
      time: "2 mins ago",
    },
    {
      id: 2,
      customer: "Darshu",
      service: "Salon",
      vendor: "Beauty Hub",
      status: "Completed",
      time: "15 mins ago",
    },
    {
      id: 3,
      customer: "Mike Johnson",
      service: "Plumbing",
      vendor: "QuickFix",
      status: "Assigned",
      time: "23 mins ago",
    },
    {
      id: 4,
      customer: "Emma Wilson",
      service: "AC Repair",
      vendor: "CoolTech",
      status: "Pending",
      time: "45 mins ago",
    },
  ];

  // Progress bar color
  const getProgressColor = (percent) => {
    if (percent < 40) return "bg-red-500";
    if (percent < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100";
      case "In Progress":
        return "text-blue-600 bg-blue-100";
      case "Assigned":
        return "text-purple-600 bg-purple-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800 shadow-md rounded-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your platform performance and key metrics
        </p>

        
        
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Revenue + Recent Bookings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 💰 Revenue Insights */}
        <Card className="bg-gradient-to-br from-white to-gray-100 dark:from-neutral-800 dark:to-neutral-900 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Insights
            </CardTitle>
            <CardDescription>
              Performance metrics for the current month
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {[
              { label: "Daily Revenue", value: "₹45,280", percent: 75 },
              { label: "Active Subscriptions", value: "3000", percent: 60 },
              { label: "Vendor Response Rate", value: "92%", percent: 92 },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-lg font-bold">{item.value}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(
                      item.percent
                    )} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${item.percent}%`, minWidth: "5%" }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 🕒 Recent Bookings */}
        <Card className="bg-gradient-to-br from-white to-gray-100 dark:from-neutral-800 dark:to-neutral-900 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Bookings
            </CardTitle>
            <CardDescription>
              Latest service requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{booking.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.service} • {booking.vendor}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.time}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 mt-2 sm:mt-0 rounded-full ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
