"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../../globals.css";
import { IoIosLogOut } from "react-icons/io";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";
import { logout } from "@/lib/database/actions/admin/auth/logout";
import { navItems } from "@/components/admin/dashboard/NavItems/NavItems";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Do you want to log out?");
    if (confirmLogout) {
      try {
        const response = await logout();
        if (response?.message === "Successfully logged out!") {
          router.push("/");
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-fit w-full">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-[30%] xl:w-[20%] z-50 h-full bg-gray-800 transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-64`}
      >
        <div className="flex flex-col h-full p-4">
          <nav className="flex-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  pathname === item.link
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 mt-auto text-gray-300 rounded-lg hover:bg-gray-700"
          >
            <IoIosLogOut className="text-red-400" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col justify-center items-center w-fit h-fit bg-gray-100">
        <button
          onClick={toggleSidebar}
          className="fixed z-40 p-2 m-4 text-white rounded-lg md:hidden bg-gray-800 hover:bg-gray-700"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className="w-full flex flex-col justify-center items-center p-4 md:p-6 md:ml-64">{children}</div>
      </main>
    </div>
  );
}
