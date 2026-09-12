import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Mail,
    ChevronDown,
    ChevronUp,
    Book,
    LifeBuoy,
    ShieldCheck,
    CreditCard,
    Video,
    BadgeCheck,
    MessageSquare,
    ClipboardList,
    ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/core/router/paths";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    // General
    {
        category: "General",
        question: "What is Skillbyte?",
        answer:
            "Skillbyte is an e-learning platform where students can enroll in expert-led courses, book live 1-on-1 mentorship sessions via video call, take interactive quizzes, and earn verifiable certificates. Instructors can publish courses, manage mentorship slots, track earnings, and interact with students via real-time chat.",
    },
    {
        category: "General",
        question: "Who can use Skillbyte?",
        answer:
            "Skillbyte has three roles: Students (learn by enrolling in courses, booking mentorship, taking quizzes), Instructors (create courses, manage mentorship slots, earn revenue), and Admins (approve instructors, manage courses, handle withdrawals and reports). Each role has a dedicated dashboard.",
    },
    {
        category: "General",
        question: "Is Skillbyte free to use?",
        answer:
            "Browsing the platform is free. Individual courses are paid — pricing is set by instructors. Mentorship sessions are also paid per booking. All payments are processed securely via Stripe and PayPal.",
    },
    // Courses
    {
        category: "Courses",
        question: "How do I enroll in a course?",
        answer:
            "Sign in as a student, browse available courses, and click on a course you're interested in. From the course detail page, click 'Enroll Now' to proceed to checkout. After payment via Stripe or PayPal, you'll get instant access to all course content.",
    },
    {
        category: "Courses",
        question: "Where can I find my enrolled courses?",
        answer:
            "Once enrolled, your courses appear under 'My Courses' in the student navigation. You can access all lessons, videos, and quizzes from there.",
    },
    {
        category: "Courses",
        question: "Can I leave a review on a course?",
        answer:
            "Yes. After enrolling in a course, you can leave a rating and written review. All reviews are moderated by admins to maintain quality. Instructors can see their course reviews from their dashboard.",
    },
    // Mentorship
    {
        category: "Mentorship",
        question: "How does mentorship work on Skillbyte?",
        answer:
            "Students can browse available instructors in the Mentorship section and book a 1-on-1 session from their open time slots. Once a booking is confirmed, both parties can join a live video call session directly on the platform.",
    },
    {
        category: "Mentorship",
        question: "How do I join a video call session?",
        answer:
            "When your booked session time arrives, go to your bookings page. You'll see a 'Join Call' option for active sessions. Both the student and instructor need to be online to start the session.",
    },
    // Quizzes & Certificates
    {
        category: "Quizzes & Certificates",
        question: "Are there quizzes in Skillbyte courses?",
        answer:
            "Yes. Instructors can configure quizzes for their courses with custom questions, pass marks, and time limits. Students can attempt quizzes from their enrolled course page, and results are shown immediately after submission.",
    },
    {
        category: "Quizzes & Certificates",
        question: "How do I earn a certificate?",
        answer:
            "Certificates are issued upon completing a course. Once eligible, you can generate and download your certificate from the 'My Courses' section. Each certificate has a unique verification link that anyone can use to confirm its authenticity.",
    },
    {
        category: "Quizzes & Certificates",
        question: "Can someone verify my certificate?",
        answer:
            "Yes. Every Skillbyte certificate includes a unique verification code. Anyone can go to the public certificate verification page and enter the code (or open the verification link) to confirm the certificate's authenticity.",
    },
    // Payments
    {
        category: "Payments",
        question: "What payment methods does Skillbyte accept?",
        answer:
            "Skillbyte uses Stripe and PayPal as its payment gateways. You can pay using debit/credit cards, and other supported methods. All transactions are secure and encrypted.",
    },
    {
        category: "Payments",
        question: "Can I view my payment history?",
        answer:
            "Yes. Students can view all past course enrollments and payments in the 'Purchase History' section from the student navigation menu.",
    },
    // Technical
    {
        category: "Technical",
        question: "Is the video call system secure?",
        answer:
            "Yes. Video calls on Skillbyte are conducted through encrypted real-time sessions. Only the student and instructor involved in the booking can access the call.",
    },
    {
        category: "Technical",
        question: "How does real-time chat work?",
        answer:
            "Skillbyte has a built-in real-time chat system accessible from the navigation bar (after logging in). You can message instructors you are connected with directly — no third-party app required.",
    },
    {
        category: "Technical",
        question: "I forgot my password. What should I do?",
        answer:
            "Click 'Forgot Password' on the sign-in page. Enter your registered email address and you'll receive an OTP. Verify the OTP and set a new password to regain access to your account.",
    },
    // Instructors
    {
        category: "Instructors",
        question: "How do I become an instructor on Skillbyte?",
        answer:
            "Sign up as an instructor using the Instructor Registration page. Submit your profile and qualifications. An admin will review and approve your account. Once approved, you can create and publish courses.",
    },
    {
        category: "Instructors",
        question: "How do instructors get paid?",
        answer:
            "Instructors earn a share of each course enrollment and mentorship booking. Earnings are tracked in the Instructor Earnings dashboard. Instructors can request withdrawals, which are processed and approved by the platform admin.",
    },
];

const categories = [
    { icon: <Book size={18} />, label: "General" },
    { icon: <ClipboardList size={18} />, label: "Courses" },
    { icon: <Video size={18} />, label: "Mentorship" },
    { icon: <BadgeCheck size={18} />, label: "Quizzes & Certificates" },
    { icon: <CreditCard size={18} />, label: "Payments" },
    { icon: <ShieldCheck size={18} />, label: "Technical" },
    { icon: <LifeBuoy size={18} />, label: "Instructors" },
];

const SupportPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredFaqs = faqs.filter((faq) => {
        const matchesSearch =
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory ? faq.category === activeCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
    <div className="min-h-screen overflow-hidden bg-white text-gray-800 dark:bg-[#050914] dark:text-gray-100">
        {/* Search Header */}
        <section className="relative bg-gradient-to-br from-blue-600 to-blue-500 py-20 text-white">
            <div className="container mx-auto px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 text-4xl font-bold md:text-5xl"
                >
                    Help Center
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 text-lg text-blue-100"
                >
                    Find answers to common questions about Skillbyte's features.
                </motion.p>

                <div className="relative mx-auto max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-400" />

                    <input
                        type="text"
                        id="support-search"
                        placeholder="Search help topics, e.g. 'certificate', 'payment', 'quiz'..."
                        className="w-full rounded-2xl bg-white py-4 pl-12 pr-4 text-gray-800 shadow-xl outline-none transition-all focus:ring-4 focus:ring-blue-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Abstract Shapes */}
            <div className="absolute -mr-32 -mt-32 right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -mb-32 -ml-32 bottom-0 left-0 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        </section>

        {/* Contact Info */}
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-xl">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-[#0b1220]"
                    >
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md dark:bg-[#101827]">
                            <Mail className="text-blue-500" />
                        </div>

                        <h3 className="mb-1 text-xl font-bold">
                            Email Support
                        </h3>

                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=skillbyte.team@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-2 block font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                            skillbyte.team@gmail.com
                        </a>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Send us your questions or feedback — we respond within 24 hours.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Main FAQ Grid */}
        <section className="bg-gray-50 py-16 dark:bg-[#050914]">
            <div className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-3">

                    {/* Categories */}
                    <div className="space-y-3 lg:col-span-1">
                        <h2 className="mb-6 text-2xl font-bold">
                            Browse by Topic
                        </h2>

                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left shadow-sm transition-colors ${
                                activeCategory === null
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-transparent bg-white hover:border-blue-200 hover:bg-blue-50 dark:bg-[#0b1220] dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
                            }`}
                        >
                            <MessageSquare
                                size={18}
                                className={
                                    activeCategory === null
                                        ? "text-white"
                                        : "text-blue-600 dark:text-blue-400"
                                }
                            />

                            <span className="font-medium">
                                All Topics
                            </span>

                            <span
                                className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    activeCategory === null
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-500 dark:bg-[#101827] dark:text-gray-400"
                                }`}
                            >
                                {faqs.length}
                            </span>
                        </button>

                        {categories.map((cat, i) => {
                            const count = faqs.filter(
                                (f) => f.category === cat.label
                            ).length;

                            const isActive =
                                activeCategory === cat.label;

                            return (
                                <button
                                    key={i}
                                    onClick={() =>
                                        setActiveCategory(
                                            isActive ? null : cat.label
                                        )
                                    }
                                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left shadow-sm transition-colors ${
                                        isActive
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-transparent bg-white hover:border-blue-200 hover:bg-blue-50 dark:bg-[#0b1220] dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
                                    }`}
                                >
                                    <div
                                        className={
                                            isActive
                                                ? "text-white"
                                                : "text-blue-600 dark:text-blue-400"
                                        }
                                    >
                                        {cat.icon}
                                    </div>

                                    <span className="font-medium">
                                        {cat.label}
                                    </span>

                                    <span
                                        className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-gray-100 text-gray-500 dark:bg-[#101827] dark:text-gray-400"
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* FAQs */}
                    <div className="lg:col-span-2">
                        <h2 className="mb-6 text-2xl font-bold">
                            Frequently Asked Questions

                            {activeCategory && (
                                <span className="ml-3 text-base font-normal text-blue-600 dark:text-blue-400">
                                    — {activeCategory}
                                </span>
                            )}
                        </h2>

                        <div className="space-y-4">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0b1220]"
                                    >
                                        <button
                                            id={`faq-btn-${index}`}
                                            onClick={() =>
                                                setActiveAccordion(
                                                    activeAccordion === index
                                                        ? null
                                                        : index
                                                )
                                            }
                                            className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#101827]"
                                        >
                                            <div className="flex-1 pr-4">
                                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">
                                                    {faq.category}
                                                </span>

                                                <span className="text-base font-bold">
                                                    {faq.question}
                                                </span>
                                            </div>

                                            {activeAccordion === index ? (
                                                <ChevronUp
                                                    size={20}
                                                    className="flex-shrink-0 text-blue-500"
                                                />
                                            ) : (
                                                <ChevronDown
                                                    size={20}
                                                    className="flex-shrink-0 text-gray-400"
                                                />
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {activeAccordion === index && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border-t border-gray-50 p-6 pt-2 leading-relaxed text-gray-600 dark:border-gray-800 dark:text-gray-400">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-gray-800 dark:bg-[#0b1220]">
                                    <p className="mb-2 text-gray-500">
                                        No results found for "{searchQuery}"
                                    </p>

                                    <p className="text-sm text-gray-400">
                                        Try a different keyword or browse by topic.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Quick Links */}
        <section className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="mb-10 text-center text-2xl font-bold">
                    Quick Links
                </h2>

                <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: "Browse Courses",
                            to: ROUTES.student.courses,
                            icon: <Book size={20} />,
                        },
                        {
                            label: "Book Mentorship",
                            to: ROUTES.student.mentorship.browse,
                            icon: <Video size={20} />,
                        },
                        {
                            label: "My Purchases",
                            to: ROUTES.student.purchases,
                            icon: <CreditCard size={20} />,
                        },
                        {
                            label: "Verify Certificate",
                            to: ROUTES.student.verifyCertificate.replace(
                                ":verificationCode",
                                ""
                            ),
                            icon: <BadgeCheck size={20} />,
                        },
                    ].map((link, i) => (
                        <Link
                            key={i}
                            to={link.to}
                            className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-gray-800 dark:bg-[#0b1220] dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-[#101827] dark:text-blue-400">
                                {link.icon}
                            </div>

                            <span className="text-sm font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {link.label}
                            </span>

                            <ExternalLink
                                size={14}
                                className="ml-auto text-gray-400 transition-colors group-hover:text-blue-400"
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>

        {/* Still Need Help */}
        <section className="bg-gray-50 py-16 dark:bg-[#050914]">
            <div className="container mx-auto px-4">
                <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-blue-600 p-12 text-center text-white shadow-2xl">
                    <h2 className="mb-4 text-3xl font-bold">
                        Still need help?
                    </h2>

                    <p className="mb-8 text-lg text-blue-100">
                        Couldn't find what you were looking for? Reach out to us by email and we'll
                        get back to you within 24 hours.
                    </p>

                    <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=skillbyte.team@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-xl bg-white px-10 py-4 font-bold text-blue-600 shadow-lg transition-colors hover:bg-gray-100"
                    >
                        Email Us at skillbyte.team@gmail.com
                    </a>

                    {/* Decorative */}
                    <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-blue-400/20 blur-xl" />
                </div>
            </div>
        </section>
    </div>
);
};

export default SupportPage;
