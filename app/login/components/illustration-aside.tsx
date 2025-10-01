import Image from "next/image";

export default function Illustration() {
  return (
    <div className="flex flex-col items-start justify-center h-full w-full px-4 md:px-12">
      <h2 className="sm:text-xl md:text-2xl font-semibold text-white mb-2 mt-4 leading-tight">
        Secure access to your admin dashboard
      </h2>
      <p className="text-white/80 sm:text-base md:text-lg mb-8">
        Enter your credentials to manage and monitor the system
      </p>
      <Image
        src="/images/Illustration.svg"
        alt="Dashboard Illustration"
        width={420}
        height={480}
        className="object-contain"
      />
    </div>
  );
}
