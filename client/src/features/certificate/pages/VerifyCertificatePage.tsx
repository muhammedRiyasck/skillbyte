import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  CalendarDays, 
  CheckCircle2, 
  Hash, 
  ShieldCheck, 
  User,
  ExternalLink,
  BookOpen
} from "lucide-react";
import ErrorPage from "@shared/ui/ErrorPage";
import { verifyCertificate } from "../services/CertificateService";

const formatDate = (date?: string) => {
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const styles = `
  @keyframes revealUp {
    from { opacity: 0; transform: translateY(30px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes drawCheck {
    from { stroke-dashoffset: 100; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes subtleGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.1); }
    50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.2); }
  }
  .anim-reveal { animation: revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .anim-delay-1 { animation-delay: 0.1s; }
  .anim-delay-2 { animation-delay: 0.2s; }
  .anim-delay-3 { animation-delay: 0.3s; }
  .anim-delay-4 { animation-delay: 0.4s; }
  
  .verified-badge-glow {
    animation: subtleGlow 3s ease-in-out infinite;
  }
  
  .shimmer-bg {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
  }
  @keyframes shimmer {
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
  }
`;

const VerifyCertificatePage: React.FC = () => {
  const { verificationCode } = useParams<{ verificationCode: string }>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["certificate-verification", verificationCode],
    queryFn: () => verifyCertificate(verificationCode!),
    enabled: !!verificationCode,
  });

  if (isError || (!isLoading && !data)) {
    return (
      <ErrorPage
        message={(error as Error)?.message || "Certificate could not be verified"}
        statusCode={404}
      />
    );
  }

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-indigo-100 dark:border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium animate-pulse">Verifying authenticity...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-16 flex items-center justify-center font-sans">
        <div className="w-full max-w-4xl space-y-8">
          
          {/* Header Area */}
          <div className="flex justify-between items-end px-2 anim-reveal">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Validation Portal</p>
              <p className="text-sm font-medium text-gray-500">Official Certificate Record</p>
            </div>
          </div>

          {/* Main Layout Card */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700/50 overflow-hidden anim-reveal anim-delay-1">
            <div className="grid md:grid-cols-5 gap-0">
              
              {/* Left Panel: Status & Student */}
              <div className="md:col-span-2 bg-gray-50/50 dark:bg-gray-900/20 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700/50 flex flex-col justify-center text-center">
                <div className="mx-auto mb-8 relative">
                  <div className="verified-badge-glow absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full border-4 border-green-500/10 shadow-sm">
                    <ShieldCheck className="w-16 h-16 text-green-500" />
                  </div>
                </div>
                
                <span className="inline-block mx-auto mb-4 px-4 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20">
                  Verified Authentic
                </span>
                
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Issued To</h2>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                  {data!.student.name}
                </h1>
                
                <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1 italic">Certificate ID</p>
                  <p className="font-mono text-xs font-medium text-gray-500 break-all bg-white dark:bg-gray-800 py-2 px-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                    {data!.certificateId}
                  </p>
                </div>
              </div>

              {/* Right Panel: Content Details */}
              <div className="md:col-span-3 p-8 md:p-12 space-y-10">
                
                {/* Course Info */}
                <div className="anim-reveal anim-delay-2">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Educational Achievement</p>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    {data!.course.title}
                  </h3>
                  <div className="mt-3 flex gap-4">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-md">
                      {data!.course.courseLevel}
                    </span>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-md">
                      {data!.course.category}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 space-y-6 sm:grid-cols-2 gap-6 anim-reveal anim-delay-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Instructor</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {data!.instructor?.name || "Skillbyte Faculty"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <CalendarDays className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Completion Date</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {formatDate(data!.completedAt || data!.issuedAt)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Hash className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Serial Number</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white font-mono">
                      {data!.certificateNumber}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Status</span>
                    </div>
                    <p className="text-base font-bold text-green-600 dark:text-green-400">
                      Active & Valid
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 anim-reveal anim-delay-4">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Secure Validation via Skillbyte Infrastructure
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                Back to Platform
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default VerifyCertificatePage;
