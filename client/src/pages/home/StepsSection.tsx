import React from "react";
const steps = [
  {
    step: "1",
    title: "Create Account",
    desc: "Sign up with your email and secure password.",
  },
  {
    step: "2",
    title: "Verify Email",
    desc: "Confirm your email address via a verification link.",
  },
  {
    step: "3",
    title: "Sign In Securely",
    desc: "Access your account with validated credentials.",
  },
];
const StepsSection: React.FC = () => {
  return (
    <section className="px-4 md:px-8 py-12 text-center">
      <h2 className="text-2xl font-bold mb-6">Simple Steps to Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {steps.map((item) => (
          <div key={item.step}>
            <div className="text-3xl font-bold mb-2">{item.step}</div>
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StepsSection;
