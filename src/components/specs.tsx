import hangman from "../assets/hangman.png";
import leo from "../assets/leo.png";
import bob from "../assets/bob.png";
import ImageCard from "./specs/imgcard";
import SpecRow from "./specs/specrow";

// Survivor’s Specifications

const Specifications = () => {
  const specifications = [
    { label: "Core", value: "Post-Rug Photos — minted scars, proof you made it through the wreckage." },
    { label: "Supply", value: "Limited to those who endure — every piece earned, never given." },
    { label: "POWER", value: "Grit, humor, and a movement that refuses to die." },
    { label: "Utility", value: "More than a token — it's a badge, a story, an experience." },
    { label: "Chain", value: "Forged in Hyperliquid's catacombs, where only survivors walk." },
    { label: "WEIGHT", value: "Every scar carried, every loss turned artifact." },
  ];

  return (
    <section className="min-h-screen flex">
      {/* Left Dark Section */}
      <div className="flex-1 bg-automotive-dark text-automotive-dark-foreground">
        <div className="sticky top-0 h-screen flex flex-col justify-between">
          <div>
            <div className="mb-0 bg-black">
              <h1 className="text-7xl lg:text-7xl font-header tracking-tight mb-4 text-white p-5">
                The First Wave <br />
                ( 20'-21' )
              </h1>
            </div>

            <h2 className="text-4xl font-header tracking-wider pl-5">
              Specifications
            </h2>

            <div className="mb-16 p-5">
              <div className="h-20"></div>
              <div className="space-y-1 border-t">
                {specifications.map((spec, index) => (
                  <SpecRow key={index} label={spec.label} value={spec.value} />
                ))}
              </div>
            </div>
          </div>
        </div>
  </div>
      
      {/* Right Light Section */}
      <div className="flex-1 bg-[#2a292c] text-[#fff] p-8 lg:p-16 flex flex-col gap-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-lg lg:text-3xl leading-relaxed font-body">
            The first drop wasn't polished it was forged.
            Each piece carries the mark of survival: 
            scars etched into its story, proof that it's been through the fire.
            Built on raw resilience, balanced between spectacle and
            grave, it delivers an unfiltered experience straight from the aftermath.
            This isn't decoration it's weaponry, ritual, and trophy, fused into one.
          </p>
        </div>

        <div className="space-y-8">
          <ImageCard src={hangman} alt="Hangman" label="Hangman - S1" />
          <ImageCard src={leo} alt="Leo" label="Leo - S2" />
          <ImageCard src={bob} alt="Bob" label="Bob - S3" />
        </div>
      </div>
    </section>

  );
};

export default Specifications;