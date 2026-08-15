import api from '@shared/utils/AxiosInstance';

export const getStudentProfile = async () => {
  const response = await api.get('/student/profile');
  return response.data;
};

export const updateStudentProfile = async (data: { name: string }) => {
  const response = await api.put('/student/profile', data);
  return response.data;
};

export const uploadStudentProfileImage = async (blob: Blob) => {
  const formData = new FormData();
  formData.append('profileImage', blob, 'profile.jpg');
  const response = await api.post('/student/upload-profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const removeStudentProfileImage = async () => {
  const response = await api.delete('/student/profile-image');
  return response.data;
};
