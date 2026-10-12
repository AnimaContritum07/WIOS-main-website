type EventItem = {
  title: string;
  description: string;
  date: string;
  location: string;
};

const EVENTS: EventItem[] = [
  {
    title: "NAVIGATING GOOGLE SUMMER OF CODE",
    description:
      'Anikate De and Shreyas S shared their valuable insights on navigating Google Summer of Code (GSoC), providing students with practical tips and strategies for success.',
    date: "14 NOV 2024",
    location: "NEWTON HALL",
  },
  {
    title: "GENERATIVE AI AND OPEN SOURCE",
    description:
      'We were honored to host Dr. Sunil Thomas Thonikuzhiyil, Director of ICFOSS, Kerala, for an online speaker session on "Generative AI and Open Source." He shared valuable insights on how Generative AI aligns seamlessly with FOSS.',
    date: "16 NOV 2024",
    location: "IDK WHERE",
  },
];

function EventImagePlaceholder() {
  return (
    <div
      className="flex flex-none items-center justify-center overflow-hidden rounded-2xl bg-[#E6E1F2]"
      style={{ width: 350, height: 184, aspectRatio: "175 / 92" }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="#8D7FB5"
          strokeWidth="1.5"
        />
        <circle cx="8.5" cy="10" r="1.5" fill="#8D7FB5" />
        <path
          d="M4 17l5-5 4 4 3-3 4 4"
          stroke="#8D7FB5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="#8D7FB5"
        strokeWidth="1.5"
      />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="#8D7FB5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
        stroke="#8D7FB5"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="9.5" r="2.5" stroke="#8D7FB5" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowIcon({ color = "#fff" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EventsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-20">
      {/* Anchored flush to the top and right edges of this box (the M/L
          corner points never change), only the wavy inner boundary morphs —
          so it can never drift down over the event list or left over text. */}
      <div
        className="pointer-events-none absolute right-0 top-0 hidden sm:block"
        style={{
          width: "clamp(340px, 42vw, 620px)",
          aspectRatio: "600 / 400",
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path className="blob-path" fill="#C9BBEF" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-8 sm:px-16">
        <h2 className="font-bebas text-[60px] leading-[0.95] text-black">
          LATEST EVENTS
        </h2>
        <p className="mt-1 font-cedarville text-[40px] leading-tight text-[#8D7FB5]">
          Whats happening -
        </p>

        <div className="mt-10 flex flex-col gap-12">
          {EVENTS.map((event) => (
            <div
              key={event.title}
              className="flex flex-col gap-8 lg:flex-row lg:items-center"
            >
              <EventImagePlaceholder />

              <div className="flex flex-1 flex-col gap-3">
                <h3 className="font-playfair text-[30px] leading-tight text-black">
                  {event.title}
                </h3>
                <p className="max-w-[520px] font-playfair text-[15px] leading-relaxed text-black">
                  {event.description}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 font-playpen text-[12px] text-black">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon />
                    {event.date}
                  </span>
                  <span className="text-black/30">|</span>
                  <span className="flex items-center gap-1.5">
                    <PinIcon />
                    {event.location}
                  </span>
                </div>
              </div>

              <a
                href="#"
                className="inline-flex flex-none items-center gap-2 rounded-[25px] bg-[#8D7FB5] px-6 py-3 font-poppins text-[13px] font-bold tracking-wide text-white"
              >
                VIEW EVENT
                <ArrowIcon />
              </a>
            </div>
          ))}
        </div>

        <a
          href="#"
          className="mt-14 inline-flex items-center gap-2 rounded-[25px] bg-[#8D7FB5]/15 px-6 py-3 font-poppins text-[13px] font-bold tracking-wide text-[#8D7FB5]"
        >
          MORE EVENTS
          <ArrowIcon color="#8D7FB5" />
        </a>
      </div>
    </section>
  );
}
