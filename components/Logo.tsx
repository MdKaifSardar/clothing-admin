import React from "react";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="bg-transparent pl-[50px]">
      <Link href="/" className="flex gap-[10px]">
        <Image src={"https://res.cloudinary.com/dlxpcyiin/image/upload/v1738781266/logo_copy_mgzl8b.png"} alt="logo" height={80} width={130} />
      </Link>
    </div>
  );
};

export default Logo;
