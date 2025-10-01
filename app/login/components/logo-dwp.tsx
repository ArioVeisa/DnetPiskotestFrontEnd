import Image from "next/image";

export default function LogoDWP() {
  return (
    <div className="w-full flex justify-center md:justify-start mb-8">
      <Image
        src="/images/logo-dwp.svg"
        alt="Logo DWP"
        width={100}
        height={100}
        priority
      />
    </div>
  );
}
