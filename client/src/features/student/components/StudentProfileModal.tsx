import React, { useState, useRef, useCallback } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '@features/auth/AuthSlice';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  X,
  Camera,
  Pencil,
  Check,
  Trash2,
  Mail,
  Shield,
  Calendar,
  BookOpen,
  User,
  Loader2,
} from 'lucide-react';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentProfileImage,
  removeStudentProfileImage,
} from '../services/StudentService';
import api from '@shared/utils/AxiosInstance';
import CropImageModal from '@shared/ui/CropImageModal';
import getCroppedImg from '@shared/utils/GetCroppedImg';
import default_profile from '@assets/default_profile.svg';
import type { AppDispatch } from '@/core/store/Index';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  name: string;
}

interface StudentProfile {
  id?: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  accountStatus: string;
  registeredVia: string;
  isEmailVerified?: boolean;
  createdAt?: string;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [croppedPreview, setCroppedPreview] = useState<string>('');
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const res = await getStudentProfile();
      return res?.data?.student as StudentProfile;
    },
    enabled: isOpen,
  });

  const { data: enrollmentsData } = useQuery({
    queryKey: ['student-enrollments-count'],
    queryFn: async () => {
      const res = await api.get('/enrollment/my-enrollments?page=1&limit=1');
      return res?.data?.data?.totalCount as number;
    },
    enabled: isOpen,
  });

  // ── Form ──────────────────────────────────────────────────────────────────────
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    values: { name: profileData?.name ?? '' },
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      dispatch(fetchCurrentUser());
      setEditMode(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const removeMutation = useMutation({
    mutationFn: removeStudentProfileImage,
    onSuccess: () => {
      toast.success('Profile picture removed');
      setCroppedPreview('');
      setCroppedBlob(null);
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      dispatch(fetchCurrentUser());
    },
    onError: () => toast.error('Failed to remove profile picture'),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCropModalOpen(true);
    }
    // reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleCropComplete = useCallback(
    async (croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
      if (!selectedFile) return;
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const blob = await getCroppedImg(reader.result as string, croppedAreaPixels);
        const previewUrl = URL.createObjectURL(blob);
        setCroppedPreview(previewUrl);
        setCroppedBlob(blob);
      };
    },
    [selectedFile],
  );

  const handleSaveImage = async () => {
    if (!croppedBlob) return;
    setImageUploading(true);
    try {
      await uploadStudentProfileImage(croppedBlob);
      toast.success('Profile picture updated');
      setCroppedPreview('');
      setCroppedBlob(null);
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      dispatch(fetchCurrentUser());
    } catch {
      toast.error('Failed to upload profile picture');
    } finally {
      setImageUploading(false);
    }
  };

  const handleClose = () => {
    setEditMode(false);
    setCroppedPreview('');
    setCroppedBlob(null);
    reset();
    onClose();
  };

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const avatarSrc = croppedPreview || profileData?.profilePicture || default_profile;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Blocked
      </span>
    );
  };

  const getRegistrationBadge = (via: string) => {
    const isGoogle = via === 'google';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isGoogle
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
            : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'
        }`}
      >
        {isGoogle ? '🌐' : '🔑'} {isGoogle ? 'Google' : 'Email & Password'}
      </span>
    );
  };

  return (
    <>
      {/* Crop Modal */}
      {selectedFile && (
        <CropImageModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          file={selectedFile}
          onCropComplete={handleCropComplete}
          aspect={1}
        />
      )}

      {/* Profile Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                        Profile
                      </Dialog.Title>
                      <button
                        onClick={handleClose}
                        id="student-profile-modal-close"
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* ── Avatar & Name Info ── */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group flex-shrink-0">
                        <div className="relative w-24 h-24 rounded-full border-2 border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800">
                          {isLoading ? (
                            <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
                          ) : (
                            <img
                              src={avatarSrc}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            id="student-upload-avatar-btn"
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Change photo"
                          >
                            <Camera size={22} className="text-white" />
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {isLoading ? '...' : profileData?.name}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{profileData?.email}</p>
                      </div>
                    </div>

                  {/* ── Body ── */}
                  <div className="space-y-6">
                    {/* Pending image save bar */}
                    {croppedBlob && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
                        <img
                          src={croppedPreview}
                          alt="Preview"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-400"
                        />
                        <p className="flex-1 text-sm text-indigo-700 dark:text-indigo-300">
                          New profile photo ready — save to apply
                        </p>
                        <button
                          id="student-save-avatar-btn"
                          onClick={handleSaveImage}
                          disabled={imageUploading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {imageUploading ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                          {imageUploading ? 'Saving…' : 'Save photo'}
                        </button>
                        <button
                          onClick={() => { setCroppedBlob(null); setCroppedPreview(''); }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                          title="Discard"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {/* ── Name section ── */}
                    <div className="flex items-center justify-between">
                      {editMode ? (
                        <form
                          onSubmit={handleSubmit(onSubmit)}
                          className="flex items-center gap-2 flex-1"
                        >
                          <div className="flex-1">
                            <input
                              id="student-profile-name-input"
                              {...register('name', {
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Min 2 characters' },
                                maxLength: { value: 50, message: 'Max 50 characters' },
                              })}
                              className="w-full px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Your full name"
                              autoFocus
                            />
                            {errors.name && (
                              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                            )}
                          </div>
                          <button
                            id="student-profile-save-name"
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {updateMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditMode(false); reset(); }}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-indigo-500" />
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                              {profileData?.name ?? '—'}
                            </span>
                          </div>
                          <button
                            id="student-profile-edit-name"
                            onClick={() => setEditMode(true)}
                            className="ml-1 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Edit name"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ── Divider ── */}
                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* ── Info grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Email */}
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <Mail size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">
                            {profileData?.email ?? '—'}
                          </p>
                        </div>
                      </div>

                      {/* Account Status */}
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <Shield size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Status</p>
                          {profileData ? getStatusBadge(profileData.accountStatus) : '—'}
                        </div>
                      </div>

                      {/* Registered Via */}
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <span className="text-base mt-0.5 flex-shrink-0">🔗</span>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sign-in Method</p>
                          {profileData ? getRegistrationBadge(profileData.registeredVia) : '—'}
                        </div>
                      </div>

                      {/* Member Since */}
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <Calendar size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Member Since</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {formatDate(profileData?.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Stats row ── */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                        <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                          {enrollmentsData ?? 0}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Enrolled Course{enrollmentsData !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* ── Footer actions ── */}
                    <div className="flex items-center justify-between pt-4 mt-2">
                      {/* Remove avatar */}
                      {profileData?.profilePicture && (
                        <button
                          id="student-remove-avatar-btn"
                          onClick={() => removeMutation.mutate()}
                          disabled={removeMutation.isPending}
                          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {removeMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Remove profile photo
                        </button>
                      )}
                      <div className="ml-auto">
                        <button
                          onClick={handleClose}
                          className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default StudentProfileModal;
