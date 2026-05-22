import React from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type{ CertificateDetails } from "../types/certificate.types";

export const useCertificateDownload = (data?: CertificateDetails) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const downloadCertificate = async () => {
    const element = document.querySelector(".certificate-print-area") as HTMLElement;
    if (!element || !data) return;

    setIsDownloading(true);
    try {
      // Check if document is in dark mode
      const isDarkMode = document.documentElement.classList.contains("dark") || 
                         document.body.classList.contains("dark");

      // html-to-image converts the DOM node directly to a high-fidelity PNG!
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 3, // Premium high-resolution print crispness
      });

      // Get natural dimensions from element to calculate aspect ratio
      const elWidth = element.offsetWidth;
      const elHeight = element.offsetHeight;
      const certRatio = elWidth / elHeight;

      // Create a standard Landscape A4 PDF page (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const a4Width = 297;
      const a4Height = 210;
      const a4Ratio = a4Width / a4Height;

      // Fill the entire PDF page background to match the active theme
      if (isDarkMode) {
        // Match Tailwind's bg-gray-950 / #030712
        pdf.setFillColor(3, 7, 18);
        pdf.rect(0, 0, a4Width, a4Height, "F");
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, a4Width, a4Height, "F");
      }

      let pdfWidth = a4Width;
      let pdfHeight = a4Height;
      let xOffset = 0;
      let yOffset = 0;

      // Fit the certificate preserving its exact aspect ratio centered on A4 landscape
      if (certRatio > a4Ratio) {
        // Certificate is wider than A4 landscape (relative to height)
        pdfWidth = a4Width - 20; // 10mm margins on sides
        pdfHeight = pdfWidth / certRatio;
        xOffset = 10;
        yOffset = (a4Height - pdfHeight) / 2;
      } else {
        // Certificate is taller than A4 landscape (relative to width)
        pdfHeight = a4Height - 20; // 10mm margins on top/bottom
        pdfWidth = pdfHeight * certRatio;
        yOffset = 10;
        xOffset = (a4Width - pdfWidth) / 2;
      }

      pdf.addImage(dataUrl, "PNG", xOffset, yOffset, pdfWidth, pdfHeight);
      
      const cleanCourseTitle = data.course.title.replace(/[^a-z0-9]/gi, "_");
      pdf.save(`Certificate-${cleanCourseTitle}-${data.certificateNumber}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return { isDownloading, downloadCertificate };
};
