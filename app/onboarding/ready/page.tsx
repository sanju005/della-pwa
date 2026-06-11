import Image from "next/image";

export default function ReadyPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[linear-gradient(180deg,#5e3c84_0%,#8e5eb5_60%,#a679cf_100%)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] items-start justify-center">
        <Image
          src="/ref/login-no-status.png"
          alt="SWIPER login reference"
          width={900}
          height={1600}
          priority
          className="h-auto min-h-[100dvh] w-full object-cover"
        />
      </div>
    </main>
  );
}
