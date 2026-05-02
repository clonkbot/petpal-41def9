import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { PetView } from "./components/PetView";
import { CreatePet } from "./components/CreatePet";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import "./styles.css";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pixel-star" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
        <div className="pixel-star" style={{ top: '20%', right: '20%', animationDelay: '0.5s' }} />
        <div className="pixel-star" style={{ bottom: '30%', left: '10%', animationDelay: '1s' }} />
        <div className="pixel-star" style={{ bottom: '15%', right: '15%', animationDelay: '1.5s' }} />
        <div className="pixel-heart" style={{ top: '40%', left: '5%', animationDelay: '0.3s' }} />
        <div className="pixel-heart" style={{ top: '60%', right: '8%', animationDelay: '0.8s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block pixel-bounce">
            <span className="text-6xl md:text-7xl">🐾</span>
          </div>
          <h1 className="font-pixel text-3xl md:text-4xl text-charcoal mt-4 pixel-shadow">
            PetPal
          </h1>
          <p className="font-body text-sage mt-2 text-base md:text-lg">
            Your AI companion awaits!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-cozy border-4 border-peach/30">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-charcoal text-sm font-medium block mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-sage/30 focus:border-peach focus:outline-none font-body text-charcoal bg-cream/50 transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="font-body text-charcoal text-sm font-medium block mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-sage/30 focus:border-peach focus:outline-none font-body text-charcoal bg-cream/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <p className="text-rose text-sm font-body text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 bg-peach hover:bg-peach/80 text-white font-body font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="pixel-spinner" />
                  Loading...
                </span>
              ) : (
                flow === "signIn" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="font-body text-sage hover:text-peach transition-colors text-sm"
            >
              {flow === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sage/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 font-body text-sage">or</span>
            </div>
          </div>

          <button
            onClick={() => signIn("anonymous")}
            className="w-full py-3 md:py-4 bg-sage/20 hover:bg-sage/30 text-charcoal font-body font-medium rounded-xl transition-all border-2 border-sage/30"
          >
            Continue as Guest 👋
          </button>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { signOut } = useAuthActions();
  const pet = useQuery(api.pets.get);

  // Loading state
  if (pet === undefined) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="pixel-bounce inline-block">
            <span className="text-5xl">🥚</span>
          </div>
          <p className="font-body text-sage mt-4">Loading your pet...</p>
        </div>
      </div>
    );
  }

  // No pet yet - show creation screen
  if (!pet) {
    return <CreatePet />;
  }

  // Show pet view
  return <PetView pet={pet} onSignOut={signOut} />;
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="pixel-bounce inline-block">
            <span className="text-5xl">🐾</span>
          </div>
          <p className="font-body text-sage mt-4">Waking up...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? <MainApp /> : <SignIn />}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center bg-cream/80 backdrop-blur-sm border-t border-sage/10">
        <p className="font-body text-xs text-sage/60">
          Requested by <a href="https://twitter.com/CryptoStacksss" target="_blank" rel="noopener noreferrer" className="hover:text-peach transition-colors">@CryptoStacksss</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-peach transition-colors">@clonkbot</a>
        </p>
      </footer>
    </>
  );
}
