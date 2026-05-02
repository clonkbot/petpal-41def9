import { useState, useEffect, useRef } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

const SPECIES_EMOJI: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  bunny: "🐰",
  blob: "🫧",
};

const MOOD_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  happy: { emoji: "😊", color: "bg-peach/20 text-peach", label: "Happy" },
  hungry: { emoji: "🍽️", color: "bg-rose/20 text-rose", label: "Hungry" },
  sleepy: { emoji: "😴", color: "bg-lavender/20 text-lavender", label: "Sleepy" },
  playful: { emoji: "🎮", color: "bg-sky/20 text-sky", label: "Playful" },
  sad: { emoji: "😢", color: "bg-sage/20 text-sage", label: "Sad" },
};

interface PetViewProps {
  pet: Doc<"pets">;
  onSignOut: () => void;
}

export function PetView({ pet, onSignOut }: PetViewProps) {
  const [activeTab, setActiveTab] = useState<"care" | "chat">("care");
  const [isAnimating, setIsAnimating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const feedPet = useMutation(api.pets.feed);
  const playWithPet = useMutation(api.pets.play);
  const petPet = useMutation(api.pets.pet);
  const updateMood = useMutation(api.pets.updateMood);

  // Update mood periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updateMood({ petId: pet._id });
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, [pet._id, updateMood]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleFeed = async () => {
    try {
      triggerAnimation();
      await feedPet({ petId: pet._id });
      showToast(`${pet.name} loves the food! 🍖`);
    } catch (err) {
      showToast("Oops! Something went wrong");
    }
  };

  const handlePlay = async () => {
    try {
      triggerAnimation();
      await playWithPet({ petId: pet._id });
      showToast(`${pet.name} is having fun! 🎾`);
    } catch (err) {
      showToast("Oops! Something went wrong");
    }
  };

  const handlePet = async () => {
    try {
      triggerAnimation();
      await petPet({ petId: pet._id });
      showToast(`${pet.name} purrs happily! 💕`);
    } catch (err) {
      showToast("Oops! Something went wrong");
    }
  };

  const moodConfig = MOOD_CONFIG[pet.mood] || MOOD_CONFIG.happy;

  return (
    <div className="min-h-screen bg-cream pb-16">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sage/10 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{SPECIES_EMOJI[pet.species]}</span>
            <div>
              <h1 className="font-pixel text-xl text-charcoal">{pet.name}</h1>
              <div className="level-badge text-xs">Lv. {pet.level}</div>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="font-body text-sm text-sage hover:text-rose transition-colors px-3 py-2"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Pet Display */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-cozy border-2 border-sage/10 pet-glow">
          {/* Pet */}
          <div className="text-center mb-6">
            <div
              className={`inline-block text-8xl md:text-9xl cursor-pointer transition-transform ${
                isAnimating ? "pet-happy" : "pet-idle"
              } ${pet.mood === "sleepy" ? "pet-sleepy" : ""}`}
              onClick={handlePet}
            >
              {SPECIES_EMOJI[pet.species]}
            </div>
            <div className="mt-3">
              <span className={`mood-indicator ${moodConfig.color}`}>
                <span>{moodConfig.emoji}</span>
                <span className="font-body">{moodConfig.label}</span>
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <StatBar label="Hunger" value={pet.hunger} color="bg-peach" icon="🍖" />
            <StatBar label="Happiness" value={pet.happiness} color="bg-rose" icon="💕" />
            <StatBar label="Energy" value={pet.energy} color="bg-sky" icon="⚡" />
          </div>

          {/* XP Bar */}
          <div className="mt-4 pt-4 border-t border-sage/10">
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-xs text-sage">Experience</span>
              <span className="font-body text-xs text-sage">{pet.experience % 100}/100 XP</span>
            </div>
            <div className="stat-bar">
              <div
                className="stat-fill bg-lavender"
                style={{ width: `${pet.experience % 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 mb-4">
          <button
            onClick={() => setActiveTab("care")}
            className={`flex-1 py-3 rounded-xl font-body font-medium transition-all ${
              activeTab === "care"
                ? "bg-peach text-white shadow-lg"
                : "bg-white/60 text-sage hover:bg-white"
            }`}
          >
            Care 🎀
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 rounded-xl font-body font-medium transition-all ${
              activeTab === "chat"
                ? "bg-peach text-white shadow-lg"
                : "bg-white/60 text-sage hover:bg-white"
            }`}
          >
            Chat 💬
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "care" ? (
          <CareTab onFeed={handleFeed} onPlay={handlePlay} onPet={handlePet} />
        ) : (
          <ChatTab petId={pet._id} petName={pet.name} species={pet.species} mood={pet.mood} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 toast">
          <div className="bg-charcoal text-white px-6 py-3 rounded-full font-body shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-body text-sm text-charcoal flex items-center gap-1">
          <span>{icon}</span> {label}
        </span>
        <span className="font-body text-xs text-sage">{value}%</span>
      </div>
      <div className="stat-bar">
        <div
          className={`stat-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CareTab({ onFeed, onPlay, onPet }: { onFeed: () => void; onPlay: () => void; onPet: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <ActionButton icon="🍖" label="Feed" onClick={onFeed} color="bg-peach" />
      <ActionButton icon="🎾" label="Play" onClick={onPlay} color="bg-sky" />
      <ActionButton icon="💕" label="Pet" onClick={onPet} color="bg-rose" />
    </div>
  );
}

function ActionButton({ icon, label, onClick, color }: { icon: string; label: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`action-btn ${color} p-4 md:p-6 rounded-2xl text-center shadow-lg hover:shadow-xl`}
    >
      <div className="text-3xl md:text-4xl mb-1">{icon}</div>
      <div className="font-body text-white text-sm font-medium">{label}</div>
    </button>
  );
}

function ChatTab({ petId, petName, species, mood }: { petId: Id<"pets">; petName: string; species: string; mood: string }) {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.chat.getMessages, { petId });
  const addUserMessage = useMutation(api.chat.addUserMessage);
  const addPetMessage = useMutation(api.chat.addPetMessage);
  const chat = useAction(api.ai.chat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput("");
    setIsThinking(true);

    try {
      // Add user message
      await addUserMessage({ petId, content: userMessage });

      // Get AI response
      const systemPrompt = `You are ${petName}, a cute ${species} pet. You are currently feeling ${mood}.
      Respond in a cute, playful way as if you're a beloved pet talking to your owner.
      Use cute expressions, occasional animal sounds (meow, woof, squeak, bloop depending on species), and lots of emotion.
      Keep responses short and sweet (1-3 sentences max). Be adorable and endearing!
      If your mood is hungry, occasionally mention food. If sleepy, yawn. If playful, be energetic!`;

      const response = await chat({
        messages: [{ role: "user", content: userMessage }],
        systemPrompt,
      });

      // Add pet response
      await addPetMessage({ petId, content: response });
    } catch (err) {
      await addPetMessage({ petId, content: `*${petName} tilts head confusedly* ...? 🤔` });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-cozy border-2 border-sage/10 overflow-hidden">
      {/* Messages */}
      <div className="h-64 md:h-80 overflow-y-auto p-4 hide-scrollbar">
        {(!messages || messages.length === 0) && !isThinking && (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="text-4xl mb-2">{SPECIES_EMOJI[species]}</div>
              <p className="font-body text-sage text-sm">
                Say hi to {petName}!
              </p>
            </div>
          </div>
        )}

        {messages?.map((msg: { _id: string; role: string; content: string }) => (
          <div
            key={msg._id}
            className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-pet"
              }`}
            >
              <p className="font-body text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start mb-3">
            <div className="chat-bubble-pet px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-sage/10 p-3 bg-white/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Talk to ${petName}...`}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-sage/20 focus:border-peach focus:outline-none font-body text-charcoal bg-cream/30 transition-colors"
            disabled={isThinking}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="px-5 py-3 bg-peach hover:bg-peach/80 text-white rounded-xl font-body font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
