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
        <div className="bg-white dark:bg-gray-900 overflow-hidden text-gray-800 dark:text-gray-100 min-h-screen">
            {/* Search Header */}
            <section className="relative py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                <div className="container mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Help Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-indigo-100 text-lg mb-8"
                    >
                        Find answers to common questions about Skillbyte's features.
                    </motion.p>
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            id="support-search"
                            placeholder="Search help topics, e.g. 'certificate', 'payment', 'quiz'..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800 shadow-xl focus:ring-4 focus:ring-indigo-300 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
            </section>

            {/* Contact Info */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-xl mx-auto">
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center shadow-sm hover:shadow-lg transition-all"
                        >
                            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl shadow-md flex items-center justify-center mx-auto mb-4">
                                <Mail className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-1">Email Support</h3>
                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=skillbyte.team@gmail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2 block hover:underline"
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
            <section className="py-16 bg-gray-50 dark:bg-gray-800/30">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12">

                        {/* Categories */}
                        <div className="lg:col-span-1 space-y-3">
                            <h2 className="text-2xl font-bold mb-6">Browse by Topic</h2>
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left shadow-sm border ${activeCategory === null
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white dark:bg-gray-800 border-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200"
                                    }`}
                            >
                                <MessageSquare size={18} className={activeCategory === null ? "text-white" : "text-indigo-600"} />
                                <span className="font-medium">All Topics</span>
                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${activeCategory === null ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                                    {faqs.length}
                                </span>
                            </button>
                            {categories.map((cat, i) => {
                                const count = faqs.filter((f) => f.category === cat.label).length;
                                const isActive = activeCategory === cat.label;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setActiveCategory(isActive ? null : cat.label)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left shadow-sm border ${isActive
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white dark:bg-gray-800 border-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200"
                                            }`}
                                    >
                                        <div className={isActive ? "text-white" : "text-indigo-600"}>{cat.icon}</div>
                                        <span className="font-medium">{cat.label}</span>
                                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* FAQs */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold mb-6">
                                Frequently Asked Questions
                                {activeCategory && (
                                    <span className="ml-3 text-base font-normal text-indigo-600 dark:text-indigo-400">
                                        — {activeCategory}
                                    </span>
                                )}
                            </h2>
                            <div className="space-y-4">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, index) => (
                                        <div
                                            key={index}
                                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm"
                                        >
                                            <button
                                                id={`faq-btn-${index}`}
                                                onClick={() =>
                                                    setActiveAccordion(activeAccordion === index ? null : index)
                                                }
                                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <div className="flex-1 pr-4">
                                                    <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1 block">
                                                        {faq.category}
                                                    </span>
                                                    <span className="font-bold text-base">{faq.question}</span>
                                                </div>
                                                {activeAccordion === index ? (
                                                    <ChevronUp size={20} className="flex-shrink-0 text-indigo-500" />
                                                ) : (
                                                    <ChevronDown size={20} className="flex-shrink-0 text-gray-400" />
                                                )}
                                            </button>
                                            <AnimatePresence>
                                                {activeAccordion === index && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-6 pt-2 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-700">
                                                            {faq.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                        <p className="text-gray-500 mb-2">No results found for "{searchQuery}"</p>
                                        <p className="text-sm text-gray-400">Try a different keyword or browse by topic.</p>
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
                    <h2 className="text-2xl font-bold text-center mb-10">Quick Links</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {[
                            { label: "Browse Courses", to: ROUTES.student.courses, icon: <Book size={20} /> },
                            { label: "Book Mentorship", to: ROUTES.student.mentorship.browse, icon: <Video size={20} /> },
                            { label: "My Purchases", to: ROUTES.student.purchases, icon: <CreditCard size={20} /> },
                            { label: "Verify Certificate", to: ROUTES.student.verifyCertificate.replace(":verificationCode", ""), icon: <BadgeCheck size={20} /> },
                        ].map((link, i) => (
                            <Link
                                key={i}
                                to={link.to}
                                className="flex items-center gap-3 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                                    {link.icon}
                                </div>
                                <span className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {link.label}
                                </span>
                                <ExternalLink size={14} className="ml-auto text-gray-400 group-hover:text-indigo-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Still Need Help */}
            <section className="py-16 bg-gray-50 dark:bg-gray-800/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto rounded-3xl bg-indigo-600 p-12 text-center text-white shadow-2xl relative overflow-hidden">
                        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
                        <p className="text-indigo-100 mb-8 text-lg">
                            Couldn't find what you were looking for? Reach out to us by email and we'll get back to you within 24 hours.
                        </p>
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=skillbyte.team@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Email Us at skillbyte.team@gmail.com
                        </a>

                        {/* Decorative */}
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SupportPage;
