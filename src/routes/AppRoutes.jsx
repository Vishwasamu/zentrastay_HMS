import { Routes, Route, Navigate } from "react-router-dom";

/* ===== Public Pages ===== */
import Home from "../pages/public/Home";
import AvailableRooms from "../pages/public/AvailableRooms";
import ConfirmBooking from "../pages/public/ConfirmBooking";

/* ===== Guest Pages ===== */
import GuestRegister from "../pages/guest/GuestRegister";
import GuestLogin from "../pages/guest/GuestLogin";
import GuestDashboard from "../pages/guest/GuestDashboard";
import GuestProfile from "../pages/guest/GuestProfile";
import MyBookings from "../pages/guest/MyBookings";
import GuestChat from "../pages/guest/GuestChat";
import GuestIssue from "../pages/guest/GuestIssue";
import HelpCenter from "../pages/guest/HelpCenter";
import GuestConfirmBook from "../pages/guest/Guestconfirmbook";

/* ===== Admin Pages ===== */
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import RoomsManage from "../pages/admin/RoomsManage";
import CreatePage from "../pages/admin/CreatePage";
import AdminAvailability from "../pages/admin/AdminAvailability";
import UsersManage from "../pages/admin/UsersManage";
import ReservationsManage from "../pages/admin/ReservationsManage";
import AdminIssues from "../pages/admin/AdminIssues";
import Reports from "../pages/admin/Reports"; 
import AdminChat from "../pages/admin/AdminChat";
import Settings from "../pages/admin/Settings"; 

/* ===== Layouts ===== */
import AdminLayout from "../layouts/AdminLayout";
import GuestLayout from "../layouts/GuestLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Public Routes ---------- */}
      <Route path="/" element={<Home />} />
      <Route path="/available-rooms" element={<AvailableRooms />} />
      <Route path="/confirm-booking" element={<ConfirmBooking />} />

      {/* ---------- Guest Auth Routes (no sidebar) ---------- */}
      <Route path="/guest/login" element={<GuestLogin />} />
      <Route path="/guest/register" element={<GuestRegister />} />
      <Route path="/guest/confirm-booking" element={<GuestConfirmBook />} />

      {/* ✅ ---------- Guest Routes (with sidebar) ---------- */}
      <Route path="/guest" element={<GuestLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<GuestDashboard />} />
        <Route path="profile" element={<GuestProfile />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="chat" element={<GuestChat />} />
        <Route path="issues" element={<GuestIssue />} />
        <Route path="help" element={<HelpCenter />} />
      </Route>

      {/* ---------- Admin Auth Route (no sidebar) ---------- */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ---------- Admin Routes (with sidebar) ---------- */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="rooms" element={<RoomsManage />} />
        <Route path="availability" element={<AdminAvailability />} />
        <Route path="create" element={<CreatePage />} />
        <Route path="reservations" element={<ReservationsManage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UsersManage />} />
        <Route path="issues" element={<AdminIssues />} />
        <Route path="chat" element={<AdminChat />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ---------- Redirects ---------- */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* ---------- Fallback (404) ---------- */}
      <Route path="*" element={<div style={{ padding: 20 }}>404 - Page Not Found</div>} />
    </Routes>
  );
}
