const NAV_LINKS = ["ABOUT US", "EVENTS", "GALLERY", "MEET OUR TEAM", "CONTACT"];

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-6 px-8 py-6">
      <button
        aria-label="Menu"
        className="flex flex-col gap-[5px] rounded-md bg-black/80 p-3"
      >
        <span className="block h-[2px] w-6 bg-white" />
        <span className="block h-[2px] w-6 bg-white" />
        <span className="block h-[2px] w-6 bg-white" />
      </button>

      <nav className="mx-auto flex items-center gap-10 rounded-full bg-white/90 px-12 py-4 shadow-lg backdrop-blur">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="font-poppins text-xs font-bold text-black transition-opacity hover:opacity-60"
          >
            {link}
          </a>
        ))}
      </nav>
    </header>
  );
}
