import React from "react";

const features = [
  {
    title: "Minimalist Design",
    description: "A clean, uncluttered interface focused on core functionality.",
    icon: "📐",
  },
  {
    title: "Blazing Fast",
    description: "Optimized for speed and efficiency, reducing load times.",
    icon: "⚡",
  },
  {
    title: "User-Centric",
    description: "Designed with the user journey in mind for ease of use.",
    icon: "👤",
  },
  {
    title: "Flexible Setup",
    description: "Easily integrate into existing workflows.",
    icon: "⚙️",
  },
  {
    title: "Detailed Documentation",
    description: "Comprehensive guides and resources available.",
    icon: "📘",
  },
  {
    title: "Secure Authentication",
    description: "Robust security features to protect user data.",
    icon: "🔒",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="px-4 md:px-8 py-12 bg-gray-400/20   dark:bg-gray-800 ">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-400 dark:text-white">Why Choose Skillbyte?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {features.map((item) => (
          <div
            key={item.title}
            className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
