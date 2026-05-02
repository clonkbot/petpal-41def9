import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const SPECIES = [
  { id: "cat", emoji: "🐱", name: "Kitty", description: "Mysterious & cuddly" },
  { id: "dog", emoji: "🐶", name: "Puppy", description: "Loyal & playful" },
  { id: "bunny", emoji: "🐰", name: "Bunny", description: "Gentle & fluffy" },
  { id: "blob", emoji: "🫧", name: "Blob", description: "Weird & wonderful" },
];

export function CreatePet() {
  const [name, setName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const createPet = useMutation(api.pets.create);

  const handleCreate = async () => {
    if (!name.trim() || !selectedSpecies) return;

    setIsCreating(true);
    setError("");

    try {
      await createPet({ name: name.trim(), species: selectedSpecies });
    } catch (err) {
      setError("Failed to create pet. Please try again!");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pixel-star" style={{ top: '15%', left: '10%', animationDelay: '0s' }} />
        <div className="pixel-star" style={{ top: '25%', right: '15%', animationDelay: '0.7s' }} />
        <div className="pixel-heart" style={{ bottom: '20%', left: '8%', animationDelay: '0.4s' }} />
        <div className="pixel-heart" style={{ top: '35%', right: '10%', animationDelay: '1.2s' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block pixel-bounce">
            <span className="text-6xl md:text-7xl">🥚</span>
          </div>
          <h1 className="font-pixel text-2xl md:text-3xl text-charcoal mt-4 pixel-shadow">
            Adopt Your Pet!
          </h1>
          <p className="font-body text-sage mt-2">
            Choose a companion to care for
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-cozy border-4 border-sage/20">
          {/* Name input */}
          <div className="mb-6">
            <label className="font-body text-charcoal text-sm font-medium block mb-2">
              What will you name your pet?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border-2 border-sage/30 focus:border-peach focus:outline-none font-body text-charcoal bg-cream/50 transition-colors text-center text-lg"
              placeholder="Enter a cute name..."
            />
          </div>

          {/* Species selection */}
          <div className="mb-6">
            <label className="font-body text-charcoal text-sm font-medium block mb-3">
              Choose your companion
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SPECIES.map((species) => (
                <button
                  key={species.id}
                  onClick={() => setSelectedSpecies(species.id)}
                  className={`species-card p-4 rounded-2xl border-2 transition-all ${
                    selectedSpecies === species.id
                      ? "border-peach bg-peach/10 selected"
                      : "border-sage/20 bg-white hover:border-sage/40"
                  }`}
                >
                  <div className="text-4xl mb-2">{species.emoji}</div>
                  <div className="font-body font-semibold text-charcoal text-sm">
                    {species.name}
                  </div>
                  <div className="font-body text-sage text-xs mt-1">
                    {species.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-rose text-sm font-body text-center mb-4">{error}</p>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !selectedSpecies || isCreating}
            className="w-full py-3 md:py-4 bg-peach hover:bg-peach/80 text-white font-body font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none shadow-lg disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="pixel-spinner" />
                Hatching...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Adopt {name || "your pet"}</span>
                <span>{selectedSpecies ? SPECIES.find(s => s.id === selectedSpecies)?.emoji : "🥚"}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
