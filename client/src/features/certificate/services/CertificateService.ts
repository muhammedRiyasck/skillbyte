import api from "@shared/utils/AxiosInstance";
import type { CertificateDetails } from "../types/certificate.types";

export const issueCertificate = async (
  courseId: string,
): Promise<CertificateDetails> => {
  const response = await api.post(`/certificate/course/${courseId}/issue`);
  return response.data.data;
};

export const getCertificate = async (
  certificateId: string,
): Promise<CertificateDetails> => {
  const response = await api.get(`/certificate/${certificateId}`);
  return response.data.data;
};

export const verifyCertificate = async (
  verificationCode: string,
): Promise<CertificateDetails> => {
  const response = await api.get(`/certificate/verify/${verificationCode}`);
  return response.data.data;
};
