import TopbarDashboard from "@/components/admin/dashboard/Topbar/index";
import { ToastContainer } from "react-toastify";

// ...existing code...

const TopbarPage = () => {
  return (
    <div className="flex flex-col justify-center items-center w-[90%] md:w-[70%]">
      <ToastContainer />
      {/* ...existing code... */}
      <TopbarDashboard />
      {/* ...existing code... */}
    </div>
  );
};

export default TopbarPage;
