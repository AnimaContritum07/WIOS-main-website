type Variant = "solid" | "ghost";

export default function ExploreButton({
  children,
  variant = "solid",
  href = "#",
}: {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
}) {
  return (
    <a
      href={href}
      className={`explore-btn ${
        variant === "ghost" ? "explore-btn--ghost" : ""
      } px-10 py-3 font-phetsarath text-[15px] font-normal text-[#674EAD]`}
    >
      {children}
    </a>
  );
}
