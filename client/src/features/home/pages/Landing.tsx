import React,{ useRef, useState} from "react";


import { motion } from "framer-motion";
import FeaturesSection from "../components/FeaturesSection";
import StepsSection from "../components/StepsSection";
import HeroSection from "../components/HeroSection";


const LandingPage: React.FC = () => {
  const [highlight,setHighlight] = useState(false)
  
  const divRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
     divRef?.current?.scrollIntoView({ behavior: "smooth" });
     setHighlight(true);
     setTimeout(() => setHighlight(false), 1500);
  };

  return (
    <div className="bg-white min-h-screen dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <motion.div
        initial={{ opacity: -1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <HeroSection steps={handleClick} />
        <FeaturesSection />
        <StepsSection ref={divRef} highlight={highlight} />
      </motion.div>
    </div>
  );
};

export default LandingPage;
