import Image from "next/image";

export default function Commitment() {
  return (
    <section className="py-8 lg:py-10 bg-white" aria-labelledby="commitment-heading">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#eef5ff] via-[#f5f9ff] to-[#eef7ee] border border-blue-100 grid grid-cols-1 md:grid-cols-[1.4fr_0.6fr_0.9fr] items-center gap-6 p-6 sm:p-8 lg:p-10">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#0f7a4a]">
              <span className="h-[2px] w-6 bg-[#0f7a4a] rounded-full" aria-hidden="true" />
              Our Commitment
            </p>
            <h2
              id="commitment-heading"
              className="mt-1 text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold tracking-tight text-[#0a1f44]"
            >
              Driving Financial Growth <span className="text-orange-500">in Odisha</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl">
              Beyond loans, we are committed to supporting Odisha&apos;s economic growth by enabling vehicle ownership,
              business expansion and new opportunities for individuals and entrepreneurs.
            </p>
          </div>

          <div className="relative w-40 mx-auto md:w-full max-w-[200px]" style={{ aspectRatio: "150 / 112" }}>
            <Image
              src="/home/odisha-map.webp"
              alt="Odisha Focused Always"
              fill
              sizes="200px"
              className="object-contain mix-blend-multiply"
              loading="lazy"
            />
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "232 / 132" }}>
            <Image
              src="/home/plant.webp"
              alt="Hands holding a young plant — growth"
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
