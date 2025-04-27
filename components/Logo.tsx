import React from "react";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="bg-transparent pl-[50px]">
      <Link href="/" className="flex gap-[10px]">
        <Image
          src={
            "https://res.cloudinary.com/djndrffon/image/upload/v1745779039/Logo_qjg4zv.png"
          }
          alt="logo"
          height={80}
          width={130}
        />
      </Link>
    </div>
  );
};

export default Logo;
