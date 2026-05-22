import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import ErrorPage from "@shared/ui/ErrorPage";
import skillbyteLogo from "@assets/OrginalLogo.png";
import { getCertificate } from "../services/CertificateService";
import { useCertificateDownload } from "../hooks/useCertificateDownload";

const formatDate = (date?: string) => {
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const CertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["certificate", certificateId],
    queryFn: () => getCertificate(certificateId!),
    enabled: !!certificateId,
  });

  const { isDownloading, downloadCertificate } = useCertificateDownload(data);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorPage
        message={(error as Error)?.message || "Certificate not found"}
        statusCode={404}
      />
    );
  }

  const appBase = import.meta.env.VITE_APP_URL || window.location.origin;
  const verificationUrl = `${appBase}/certificate/verify/${data.verificationCode}`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8 print:bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex justify-end print:hidden">
          <button
            onClick={downloadCertificate}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 cursor-pointer transition-all"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
        </div>

        <section className="certificate-print-area bg-white dark:bg-gray-950 border-[10px] border-indigo-100 dark:border-indigo-900 shadow-xl print:shadow-none">
          <div className="certificate-print-inner relative border border-indigo-300 dark:border-indigo-700 m-4 px-8 py-10 text-center min-h-[680px] flex flex-col">
            <div className="absolute left-8 top-8">
              <img
                src={skillbyteLogo}
                alt="Skillbyte"
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="mt-16 md:mt-8">
              <Award className="mx-auto mb-4 h-12 w-12 text-gray-950 dark:text-white" />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-3">
                Official Recognition
              </p>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-gray-500 dark:text-gray-400">
                Certificate of Completion
              </p>
              <h1 className="mt-5 text-4xl md:text-6xl font-black text-gray-950 dark:text-white">
                {data.student.name}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                has successfully completed the course
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-3xl md:text-4xl font-extrabold text-indigo-700 dark:text-indigo-300">
                {data.course.title}
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <CalendarDays className="w-4 h-4" />
                  Completed on
                </div>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">
                  {formatDate(data.completedAt || data.issuedAt)}
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Instructor
                </div>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">
                  {data.instructor.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.instructor.title}
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Course level
                </div>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">
                  {data.course.courseLevel}
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Certificate No.
                </div>
                <p className="mt-2 font-bold text-gray-900 dark:text-white break-all">
                  {data.certificateNumber}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-10">
              <div className="h-px bg-gray-200 dark:bg-gray-800" />
              <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>Issued on {formatDate(data.issuedAt)}</span>
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Verify: {verificationUrl}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CertificatePage;
