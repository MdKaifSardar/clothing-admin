import { MdSpaceDashboard, MdOutlineCategory } from "react-icons/md";
import { IoListCircleSharp } from "react-icons/io5";
import { FaTable } from "react-icons/fa";
import { BsPatchPlus } from "react-icons/bs";
import { RiCoupon3Fill } from "react-icons/ri";
import { VscGraph } from "react-icons/vsc";
import { FaRegRectangleList, FaUsers } from "react-icons/fa6";
import { ImUsers } from "react-icons/im";

export const navItems = [
  {
    name: "Admin Dashboard",
    icon: <MdSpaceDashboard size={20} />,
    link: "/admin/dashboard",
  },
  {
    name: "Users",
    icon: <ImUsers size={20} />,
    link: "/admin/dashboard/users",
  },
  {
    name: "Admins",
    icon: <ImUsers size={20} />,
    link: "/admin/dashboard/admins",
  },
  {
    name: "Add Fabrics",
    icon: <ImUsers size={20} />,
    link: "/admin/dashboard/shirts/fabric",
  },
  {
    name: "Add Colors",
    icon: <ImUsers size={20} />,
    link: "/admin/dashboard/shirts/color",
  },
  {
    name: "Shirt DashBoard",
    icon: <ImUsers size={20} />,
    link: "/admin/dashboard/shirts/shirt-dashboard",
  },
  {
    name: "Coupons",
    icon: <RiCoupon3Fill size={20} />,
    link: "/admin/dashboard/coupons",
  },
  {
    name: "Orders",
    icon: <IoListCircleSharp size={20} />,
    link: "/admin/dashboard/order-new",
  },
];
