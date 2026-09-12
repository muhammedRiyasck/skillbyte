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
    <div className="min-h-screen bg-white text-gray-800 dark:bg-[#050914] dark:text-gray-100">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-24 dark:from-[#050914] dark:via-[#080e1b] dark:to-[#0b1220]">
            <div className="container relative z-10 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <span className="mb-6 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        About Skillbyte
                    </span>

                    <h1 className="mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-6xl">
                        Learn. Practice. Grow.
                    </h1>

                    <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl">
                        Skillbyte is a full-stack e-learning platform where students enroll in
                        expert-led courses, book live 1-on-1 mentorship sessions, take interactive
                        quizzes, and earn verifiable certificates — all in one place.
                    </p>
                </motion.div>
            </div>

            {/* Background blobs */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
                <div className="absolute left-10 top-10 h-72 w-72 animate-pulse rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />
                <div className="absolute bottom-10 right-10 h-96 w-96 animate-pulse rounded-full bg-blue-200/20 blur-3xl delay-700 dark:bg-blue-500/5" />
            </div>
        </section>

        {/* Platform Stats */}
        <section className="border-y border-gray-100 bg-white py-16 dark:border-gray-800 dark:bg-[#080e1b]">
            <div className="container mx-auto px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 gap-8 md:grid-cols-4"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-[#0b1220]"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                {stat.icon}
                            </div>

                            <p className="mb-1 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                                {stat.value}
                            </p>

                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-white py-20 dark:bg-[#080e1b]">
            <div className="container mx-auto px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid gap-10 md:grid-cols-2"
                >
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-[#0b1220]"
                    >
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <Target size={32} />
                        </div>

                        <h2 className="mb-4 text-2xl font-bold">
                            Our Mission
                        </h2>

                        <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                            To make high-quality, mentor-led education accessible to everyone —
                            combining structured courses, personalized video mentorship, and
                            hands-on assessments that build real, job-ready skills.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-[#0b1220]"
                    >
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <Eye size={32} />
                        </div>

                        <h2 className="mb-4 text-2xl font-bold">
                            Our Vision
                        </h2>

                        <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                            To be the go-to platform where learners and instructors grow together
                            — where every course is a gateway to opportunity, every mentorship
                            session unlocks potential, and every certificate is proof of real
                            progress.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>

        {/* Platform Features */}
        <section className="bg-gray-50 py-20 dark:bg-[#050914]">
            <div className="container mx-auto px-4">
                <div className="mb-14 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        What Skillbyte Offers
                    </h2>

                    <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
                        Every feature on Skillbyte is built and live — here's what you get as a
                        student or instructor.
                    </p>

                    <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-blue-600" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {platformFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-[#0b1220]"
                        >
                            <div
                                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[feature.color]}`}
                            >
                                {feature.icon}
                            </div>

                            <h3 className="mb-2 text-lg font-bold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {feature.title}
                            </h3>

                            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* Why Choose Skillbyte */}
        <section className="bg-white py-20 dark:bg-[#080e1b]">
            <div className="container mx-auto px-4">
                <div className="mb-14 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        Why Students Choose Skillbyte
                    </h2>

                    <div className="mx-auto h-1.5 w-20 rounded-full bg-blue-600" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {[
                        {
                            icon: <Users />,
                            title: "Verified Instructors",
                            desc: "All instructors go through an admin-approved onboarding process before publishing courses.",
                        },
                        {
                            icon: <Rocket />,
                            title: "Project-Based Learning",
                            desc: "Courses are built around practical content — videos, tasks, and quizzes that build real skills.",
                        },
                        {
                            icon: <Shield />,
                            title: "Secure Payments",
                            desc: "All transactions are processed via Stripe and PayPal with end-to-end encryption and full purchase history.",
                        },
                        {
                            icon: <Star />,
                            title: "Review-Driven Quality",
                            desc: "Courses are rated and reviewed by real students. Admins moderate content to maintain standards.",
                        },
                        {
                            icon: <Zap />,
                            title: "Instant Enrollment",
                            desc: "Pay once and get immediate access to all course content — no wait time, no approval needed.",
                        },
                        {
                            icon: <Video />,
                            title: "Live Video Mentorship",
                            desc: "Book slots with instructors for 1-on-1 video sessions — powered by real-time video calling.",
                        },
                        {
                            icon: <BadgeCheck />,
                            title: "Shareable Certificates",
                            desc: "Get a unique verifiable certificate URL after completing a course — perfect for your portfolio.",
                        },
                        {
                            icon: <MessageSquare />,
                            title: "Direct Messaging",
                            desc: "Message your instructors directly through the platform's real-time chat system.",
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center transition-colors hover:border-blue-200 dark:border-gray-800 dark:bg-[#0b1220] dark:hover:border-blue-500/40"
                        >
                            <div className="mb-4 flex h-14 w-14 transform items-center justify-center rounded-full bg-white text-blue-600 shadow-md transition-transform hover:scale-110 dark:bg-[#101827] dark:text-blue-400">
                                {item.icon}
                            </div>

                            <h3 className="mb-2 text-base font-semibold">
                                {item.title}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20 dark:bg-[#080e1b]">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-500 p-12 text-white shadow-2xl"
                >
                    <h2 className="mb-6 text-3xl font-bold md:text-5xl">
                        Ready to start learning?
                    </h2>

                    <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
                        Join Skillbyte today — explore courses, book mentorship sessions, and earn
                        certificates that actually mean something.
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            to={ROUTES.student.courses}
                            className="rounded-xl bg-white px-8 py-4 font-bold text-blue-600 shadow-lg transition-colors hover:bg-gray-100"
                        >
                            Explore Courses
                        </Link>

                        <Link
                            to={ROUTES.auth.instructorRegister}
                            className="rounded-xl border-2 border-white/30 px-8 py-4 font-bold transition-all hover:border-white"
                        >
                            Become an Instructor
                        </Link>
                    </div>

                    {/* Background elements */}
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl" />
                </motion.div>
            </div>
        </section>
    </div>
);
};

export default AboutPage;
