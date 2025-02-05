"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../../globals.css";
import { IoIosLogOut } from "react-icons/io";
import Link from "next/link";
import { logout } from "@/lib/database/actions/admin/auth/logout";
import { navItems } from "@/components/admin/dashboard/NavItems/NavItems";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open/close state
  const router = useRouter();

  // Effect to set sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Less than 'md' size
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state based on window size
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Do you want to log out?");
    if (confirmLogout) {
      try {
        const response = await logout();
        if (response?.message === "Successfully logged out!") {
          router.push("/"); // Navigate to home after successful logout
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar open/close state
  };

  return (
    <div className="flex h-fit w-full">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="absolute md:block pt-[4rem] bg-gray-900 p-[1rem] gap-[1rem] flex flex-col justify-between items-center h-full w-[70%] md:w-[20%]">
          <div className="w-full flex flex-col justify-center items-start gap-[.5rem]">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="flex flex-row justify-start items-center text-white w-full gap-4 p-[.5rem] rounded-md hover:bg-gray-700"
              >
                <Link href={item.link} className="flex items-center gap-4">
                  {item.icon}
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              </div>
            ))}
          </div>

          <div
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-4 p-2 rounded-md hover:bg-gray-700 mt-6"
          >
            <IoIosLogOut size={20} className="text-red-400" />
            {isSidebarOpen && <span>Logout</span>}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-[1rem] left-[1rem] z-10 p-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-all duration-300`}
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? "<" : ">"}
      </button>

      {/* Main Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}
