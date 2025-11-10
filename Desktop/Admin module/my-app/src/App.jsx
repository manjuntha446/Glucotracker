import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customer from "./pages/Customer";
import Booking from "./pages/Booking";
import Index from "./pages/Index";
import Review from "./pages/Review";
import Subscription from "./pages/Subscription";
import Vendor from "./pages/Vendor";
import { DashboardLayout } from "./components/DashboardLayout";
import Pashu from "./pages/Pashu";

function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* protected routes with sidebar */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/index" element={<Index />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/review" element={<Review />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/vendor" element={<Vendor />} />
        <Route path="/pashu" element={<Pashu/>}/>
      </Route>
       



      

    </Routes>

  );
}

export default App;
