import Image from "next/image";
import { ShieldCheck, Zap, Users, Award } from "lucide-react";

const FEATURES = [
  { icon: ShieldCheck, title: "Customer First", desc: "Your needs, our priority at every step.", bg: "bg-green-50", fg: "text-green-600" },
  { icon: Zap, title: "Fast & Hassle-Free", desc: "Simple process with quick approvals.", bg: "bg-orange-50", fg: "text-orange-500" },
  { icon: Users, title: "Trusted Partners", desc: "Backed by leading banks and NBFCs.", bg: "bg-blue-50", fg: "text-blue-600" },
  { icon: Award, title: "Transparent & Reliable", desc: "Clear terms, no hidden charges.", bg: "bg-orange-50", fg: "text-orange-500" },
];

export default function WhyChoose() {
  return (
    <section id="why-ezyloan" className="py-8 lg:py-10 bg-white scroll-mt-24" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: "425 / 186" }}>
          <Image
            src="/home/office.webp"
            alt="EzyLoan office reception"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
            loading="lazy"
          />
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-[#0f7a4a]">
            <span className="h-[2px] w-6 bg-[#0f7a4a] rounded-full" aria-hidden="true" />
            Why Choose EzyLoan
            <span className="h-[2px] w-6 bg-[#0f7a4a] rounded-full" aria-hidden="true" />
          </p>
          <h2 id="why-heading" className="mt-1 text-3xl lg:text-[2.1rem] font-extrabold text-[#0a1f44] tracking-tight">
            A Partner You Can Trust
          </h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {FEATURES.map(({ icon: Icon, title, desc, bg, fg }) => (
              <div key={title} className="flex items-start gap-4">
                <span className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className={`w-7 h-7 ${fg}`} strokeWidth={2.2} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#0a1f44]">{title}</h3>
                  <p className="text-sm text-slate-600 leading-snug mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
