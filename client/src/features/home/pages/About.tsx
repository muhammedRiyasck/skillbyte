import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Users,
  Rocket,
  Shield,
  Award,
  Video,
  BookOpen,
  MessageSquare,
  ClipboardList,
  BadgeCheck,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/core/router/paths";

const AboutPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const platformFeatures = [
    {
      icon: <BookOpen size={24} />,
      title: "Course Library",
      desc: "Browse and enroll in curated courses across tech, design, and business. Each course includes structured lessons, video content, and hands-on exercises.",
      color: "indigo",
    },
    {
      icon: <Video size={24} />,
      title: "Live 1-on-1 Mentorship",
      desc: "Book real-time video call sessions with verified instructors. Choose an available slot, get personalized guidance, and accelerate your growth.",
      color: "purple",
    },
    {
      icon: <ClipboardList size={24} />,
      title: "Interactive Quizzes",
      desc: "Test your knowledge with course-specific quizzes. Track your attempts, review answers, and see detailed analytics on your performance.",
      color: "blue",
    },
    {
      icon: <BadgeCheck size={24} />,
      title: "Verified Certificates",
      desc: "Earn completion certificates upon finishing a course. Each certificate is uniquely verifiable via a public link — shareable on LinkedIn or resumes.",
      color: "green",
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Real-Time Chat",
      desc: "Communicate directly with your instructors via integrated real-time messaging. Ask questions, get feedback, and stay connected.",
      color: "pink",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Instructor Earnings",
      desc: "Instructors earn from course enrollments and mentorship sessions. Track revenue, manage withdrawals, and view enrollment analytics from a dedicated dashboard.",
      color: "orange",
    },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    purple: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
    pink: "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400",
    orange: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400",
  };

  const stats = [
    { label: "Live Courses", value: "50+", icon: <BookOpen size={20} /> },
    { label: "Expert Instructors", value: "20+", icon: <Users size={20} /> },
    { label: "Certificates Issued", value: "200+", icon: <Award size={20} /> },
    { label: "Mentorship Sessions", value: "100+", icon: <Video size={20} /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
              About Skillbyte
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Learn. Practice. Grow.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Skillbyte is a full-stack e-learning platform where students enroll in expert-led
              courses, book live 1-on-1 mentorship sessions, take interactive quizzes, and earn
              verifiable certificates — all in one place.
            </p>
          </motion.div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
                  {stat.icon}
                </div>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-10"
          >
            <motion.div
              variants={itemVariants}
              className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center rounded-xl mb-6 text-indigo-600 dark:text-indigo-400">
                <Target size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To make high-quality, mentor-led education accessible to everyone — combining
                structured courses, personalized video mentorship, and hands-on assessments that
                build real, job-ready skills.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center rounded-xl mb-6 text-purple-600 dark:text-purple-400">
                <Eye size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To be the go-to platform where learners and instructors grow together — where
                every course is a gateway to opportunity, every mentorship session unlocks potential,
                and every certificate is proof of real progress.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Skillbyte Offers</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Every feature on Skillbyte is built and live — here's what you get as a student or instructor.
            </p>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full mt-4" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colorMap[feature.color]}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Skillbyte */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Students Choose Skillbyte</h2>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full" />
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: <Users />, title: "Verified Instructors", desc: "All instructors go through an admin-approved onboarding process before publishing courses." },
              { icon: <Rocket />, title: "Project-Based Learning", desc: "Courses are built around practical content — videos, tasks, and quizzes that build real skills." },
              { icon: <Shield />, title: "Secure Payments", desc: "All transactions are processed via Stripe and PayPal with end-to-end encryption and full purchase history." },
              { icon: <Star />, title: "Review-Driven Quality", desc: "Courses are rated and reviewed by real students. Admins moderate content to maintain standards." },
              { icon: <Zap />, title: "Instant Enrollment", desc: "Pay once and get immediate access to all course content — no wait time, no approval needed." },
              { icon: <Video />, title: "Live Video Mentorship", desc: "Book slots with instructors for 1-on-1 video sessions — powered by real-time video calling." },
              { icon: <BadgeCheck />, title: "Shareable Certificates", desc: "Get a unique verifiable certificate URL after completing a course — perfect for your portfolio." },
              { icon: <MessageSquare />, title: "Direct Messaging", desc: "Message your instructors directly through the platform's real-time chat system." },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="w-14 h-14 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded-full shadow-md flex items-center justify-center mb-4 transform hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 text-white shadow-2xl overflow-hidden relative"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start learning?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
              Join Skillbyte today — explore courses, book mentorship sessions, and earn certificates that actually mean something.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={ROUTES.student.courses}
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Explore Courses
              </Link>
              <Link
                to={ROUTES.auth.instructorRegister}
                className="px-8 py-4 border-2 border-white/30 hover:border-white font-bold rounded-xl transition-all"
              >
                Become an Instructor
              </Link>
            </div>

            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
