import React,{ useRef, useState} from "react";


import { motion } from "framer-motion";
import FeaturesSection from "../components/FeaturesSection";
import StepsSection from "../components/StepsSection";
import HeroSection from "../components/HeroSection";

const LandingPage: React.FC = () => {
  const [highlight, setHighlight] = useState(false);

  const divRef = useRef<HTMLElement>(null);

  const handleClick = () => {
    divRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setHighlight(true);

    setTimeout(() => {
      setHighlight(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050914] text-gray-900 dark:text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <HeroSection steps={handleClick} />

        <FeaturesSection />

        <StepsSection
          ref={divRef}
          highlight={highlight}
        />
      </motion.div>
    </div>
  );
};


export default LandingPage;
