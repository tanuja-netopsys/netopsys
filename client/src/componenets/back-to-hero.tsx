import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToHeroButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        // Becomes visible once the user scrolls into the About section
        if (rect.top <= window.innerHeight * 0.7) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        // Fallback for pages without an #about element
        setIsVisible(window.scrollY > 400);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToHero = () => {
    const heroElem = document.getElementById("home") || document.getElementById("hero");
    if (heroElem) {
      heroElem.scrollIntoView({ behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 select-none"
        >
          <button
            type="button"
            onClick={scrollToHero}
            aria-label="Back to Hero Section"
            className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#181024]/90 hover:bg-gradient-to-tr hover:from-[#BE3093] hover:to-[#693092] text-white border border-white/15 hover:border-white/40 shadow-[0_8px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(190,48,147,0.5)] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ArrowUp className="w-5 h-5 text-white transition-transform duration-300 group-hover:-translate-y-1 stroke-[2.2]" />

          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
