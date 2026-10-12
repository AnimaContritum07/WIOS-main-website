import HeroLogo from "./HeroLogo";
import ExploreButton from "./ExploreButton";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url(/hero_bg.png)" }}
    >
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-12 px-10 pt-24 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-10">
          <h1 className="max-w-xl text-4xl font-extrabold uppercase leading-tight tracking-tight text-black sm:text-5xl">
            Where Innovation
            <br />
            Meets Opportunity
          </h1>

          <div className="flex flex-wrap gap-5">
            <ExploreButton variant="solid">Explore WiOS</ExploreButton>
            <ExploreButton variant="ghost">Join the Club</ExploreButton>
          </div>
        </div>

        <HeroLogo />
      </div>
    </section>
  );
}
