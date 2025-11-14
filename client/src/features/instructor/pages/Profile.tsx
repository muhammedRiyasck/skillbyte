import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@shared/utils/AxiosInstance";
import { toast } from "sonner";
import CropImageModal from "@shared/ui/CropImageModal";
import Modal from "@shared/ui/Modal";
import getCroppedImg from "@shared/utils/GetCroppedImg";
import Spiner from "@shared/ui/Spiner";
import ErrorPage from "@shared/ui/ErrorPage";
import default_profile from "../../../assets/defualt_profile.svg";
import TextInput from "@shared/ui/TextInput";

interface FormData {
  name:string;
  subject: string;
  jobTitle: string;
  experience: string;
  socialProfile: string;
  portfolio: string;
  profile: string;
}

const Profile: React.FC = () => {
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string>("");
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["instructor-profile"],
    queryFn: () => api.get("/instructor/profile").then((r) => r.data?.data?.instructor),
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => api.put("/instructor/profile", formData),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["instructor-profile"] });
      setEditMode(false);
      setCroppedImage("");
      setCroppedBlob(null);
      setLoading(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to update profile");
      setLoading(false);
    },
  });

  const { handleSubmit, reset, control, formState: {} } = useForm<FormData>({
    defaultValues: data ? {
      name: data.name,
      subject: data.subject,
      jobTitle: data.jobTitle,
      experience: data.experience,
      socialProfile: data.socialProfile,
      portfolio: data.portfolio,
      profile: data.profilePictureUrl,
    } : {},
  });

  React.useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        subject: data.subject,
        jobTitle: data.jobTitle,
        experience: data.experience,
        socialProfile: data.socialProfile,
        portfolio: data.portfolio,
        profile: data.profilePictureUrl,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    let profileUrl = formData.profile;
    if (croppedBlob) {
      const uploadFormData = new FormData();
      uploadFormData.append('profileImage', croppedBlob, 'profile.jpg');
      try {
        const response = await api.post('/instructor/upload-profile-image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        profileUrl = response.data?.data?.url;
      } catch (error) {
        toast.error('Failed to upload image');
        setLoading(false);
        return;
      }
    }
    const updatedData = { ...formData, profilePictureUrl: profileUrl };
    updateMutation.mutate(updatedData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setImageModalOpen(true);
      e.target.value = '';
    } else {
      toast.error("Please select a valid image file.");
    }
  };

  const handleCropComplete = async (croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    if (selectedFile) {
      const blob = await getCroppedImg(URL.createObjectURL(selectedFile as Blob), croppedAreaPixels);
      setCroppedBlob(blob);
      const reader = new FileReader();
      reader.onload = () => setCroppedImage(reader.result as string);
      reader.readAsDataURL(blob);
      setImageModalOpen(false);
    }
  };

  if (isLoading) return <Spiner />;
  if (isError) return <ErrorPage message={(error as any)?.message || "Failed to load profile"} statusCode={(error as any)?.status || 500} />;

  const profileImage = croppedImage || data?.profilePictureUrl || default_profile;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-6 dark:text-white text-center">Instructor Profile</h1>

        {!editMode ? (
          <div className="space-y-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-40 w-40 rounded-full border-8 border-white dark:border-gray-600 shadow-lg"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r  opacity-20"></div>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{data?.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{data?.email}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                <p className="mt-1 text-gray-900 dark:text-white font-semibold">{data?.subject}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
                <p className="mt-1 text-gray-900 dark:text-white font-semibold">{data?.jobTitle}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
                <p className="mt-1 text-gray-900 dark:text-white font-semibold">{data?.experience}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Social Profile</label>
                <a href={data?.socialProfile} target="_blank" rel="noopener noreferrer" className="mt-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold">View Profile</a>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio</label>
                <a href={data?.portfolio} target="_blank" rel="noopener noreferrer" className="mt-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold">View Portfolio</a>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center md:col-span-2">
              <div className="relative ">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-gray-300 dark:border-gray-600 mb-4"
                />
              </div>
              <div className="flex space-x-2">
                <label htmlFor="profile-file-input" className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {profileImage === default_profile ? "Upload Photo" : "Change Photo"}
                </label>
                {profileImage !== default_profile && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                  >
                    {loading ? <Spiner /> : "Remove Photo"}
                  </button>
                )}
              </div>
              <input
                id="profile-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="InstructorName"
                      type="text"
                      placeholder="Enter Your Name"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      helperText="This is your display name"
                    />
                    {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <Controller
                name="subject"
                control={control}
                rules={{ required: "Subject is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="subject"
                      type="text"
                      placeholder="Enter subject"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      helperText="e.g., Mathematics, Programming"
                    />
                    {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
              <Controller
                name="jobTitle"
                control={control}
                rules={{ required: "Job Title is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="jobTitle"
                      type="text"
                      placeholder="Enter job title"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      helperText="e.g., Senior Developer, Professor"
                    />
                    {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
              <Controller
                name="experience"
                control={control}
                rules={{ required: "Experience is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="experience"
                      type="text"
                      placeholder="Enter experience"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      helperText="e.g., 5 years in teaching"
                    />
                    {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Social Profile</label>
              <Controller
                name="socialProfile"
                control={control}
                rules={{ required: "Social Profile is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="socialProfile"
                      type="text"
                      placeholder="Enter social profile URL"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      helperText="e.g., https://linkedin.com/in/yourprofile"
                    />
                    {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio (Optional)</label>
              <Controller
                name="portfolio"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="portfolio"
                      type="text"
                      placeholder="Enter portfolio URL"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      helperText="e.g., https://yourportfolio.com"
                    />
                    {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => { setEditMode(false); setCroppedImage(""); setCroppedBlob(null); }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer flex items-center justify-center"
              >
                {(loading || updateMutation.isPending) ? <Spiner /> : "Save"}
              </button>
            </div>
          </form>
        )}

        {!editMode && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <CropImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        file={selectedFile!}
        onCropComplete={handleCropComplete}
        aspect={1 / 1}
      />

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Remove Photo"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to remove your profile photo? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          {/* <button
            type="button"
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button> */}
          <button
            type="button"
            onClick={async () => {
              setShowConfirmModal(false);
              if (data?.profilePictureUrl && !croppedImage) {
                setLoading(true);
                try {
                  await api.delete('/instructor/profile-image');
                  toast.success('Profile image removed');
                  queryClient.invalidateQueries({ queryKey: ["instructor-profile"] });
                } catch (error) {
                  toast.error('Failed to remove image');
                } finally {
                  setLoading(false);
                }
              }
              setCroppedImage("");
              setCroppedBlob(null);
            }}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {loading ? <Spiner /> : "Confirm Remove"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
