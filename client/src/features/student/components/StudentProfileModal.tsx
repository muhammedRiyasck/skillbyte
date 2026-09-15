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
  Calendar,
  Loader2,
  Globe,
  MapPin,
  Zap,
  Link as LinkIcon,
  Phone,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentProfileImage,
  removeStudentProfileImage,
  type UpdateStudentProfileData,
  } from '../services/StudentService';
import CropImageModal from '@shared/ui/CropImageModal';
import getCroppedImg from '@shared/utils/GetCroppedImg';
import default_profile from '@assets/default_profile.svg';
import ChangePasswordModal from './ChangePasswordModal';
import type { AppDispatch } from '@/core/store/Index';
import api from '@/shared/utils/AxiosInstance';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  name: string;
  headline?: string;
  bio?: string;
  phoneNumber?: string;
  timezone?: string;
  location?: string;
  interestsInput?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
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
  headline?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  timezone?: string | null;
  location?: string | null;
  socialLinks?: {
    linkedin?: string | undefined;
    github?: string | undefined;
    website?: string | undefined;
    twitter?: string | undefined;
  } | undefined;
  interests?: string[] | undefined;
  rank?: string | undefined;
  learningGoals?: string[] | undefined;
  xp?: number | undefined;
  currentStreak?: number | undefined;
  longestStreak?: number | undefined;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'general' | 'learning' | 'social'>('general');
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [croppedPreview, setCroppedPreview] = useState<string>('');
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

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
    mode: 'onChange',
    values: {
      name: profileData?.name ?? '',
      headline: profileData?.headline ?? '',
      bio: profileData?.bio ?? '',
      phoneNumber: profileData?.phoneNumber ?? '',
      timezone: profileData?.timezone ?? 'UTC',
      location: profileData?.location ?? '',
      interestsInput: profileData?.interests?.join(', ') ?? '',
      linkedin: profileData?.socialLinks?.linkedin ?? '',
      github: profileData?.socialLinks?.github ?? '',
      website: profileData?.socialLinks?.website ?? '',
      twitter: profileData?.socialLinks?.twitter ?? '',
    },
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
    const interestsArr = data.interestsInput
      ? data.interestsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload: UpdateStudentProfileData = {
      name: data.name,
      headline: data.headline,
      bio: data.bio,
      phoneNumber: data.phoneNumber,
      timezone: data.timezone,
      location: data.location,
      interests: interestsArr,
      socialLinks: {
        linkedin: data.linkedin,
        github: data.github,
        website: data.website,
        twitter: data.twitter,
      },
    };

    updateMutation.mutate(payload);
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

  const hasGeneralErrors = !!(errors.name || errors.headline || errors.bio || errors.location || errors.timezone);
  const hasLearningErrors = !!(errors.interestsInput);
  const hasSocialErrors = !!(errors.phoneNumber || errors.linkedin || errors.github || errors.website || errors.twitter);

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
                      <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Student Profile
                      </Dialog.Title>
                      <button
                        onClick={handleClose}
                        id="student-profile-modal-close"
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Header Card with Avatar & Gamification Badges */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/80 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30 border border-indigo-100 dark:border-indigo-900/40 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative group flex-shrink-0">
                          <div className="relative w-20 h-20 rounded-full border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden bg-gray-50 dark:bg-gray-800">
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
                              <Camera size={20} className="text-white" />
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
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {isLoading ? '...' : profileData?.name}
                          </h2>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {profileData?.headline || 'Skillbyte Learner'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{profileData?.email}</p>
                        </div>
                      </div>

                      {/* Gamification Badges */}
                      <div className="flex items-center gap-3 self-stretch sm:self-auto justify-around sm:justify-end">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                          <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
                          <span>{enrollmentsData ?? 0} Enrolled</span>
                        </div>
                        {/* <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                          <Flame size={14} className="fill-amber-500 text-amber-500 animate-bounce" />
                          <span>{profileData?.currentStreak || 0} Streak</span>
                        </div> */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                          <Zap size={14} className="fill-indigo-500 text-indigo-500" />
                          <span>{profileData?.xp || 0} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Pending Image Upload Notification */}
                    {croppedBlob && (
                      <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
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

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
                      <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer relative ${
                          activeTab === 'general'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        General Info
                        {hasGeneralErrors && <span className="absolute top-2 right-1 w-2 h-2 rounded-full bg-red-500"></span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('learning')}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer relative ${
                          activeTab === 'learning'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        Learning Preferences
                        {hasLearningErrors && <span className="absolute top-2 right-1 w-2 h-2 rounded-full bg-red-500"></span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('social')}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer relative ${
                          activeTab === 'social'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        Social & Contact
                        {hasSocialErrors && <span className="absolute top-2 right-1 w-2 h-2 rounded-full bg-red-500"></span>}
                      </button>
                    </div>

                    {/* Edit Mode Controls */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {activeTab === 'general' && 'Personal Profile'}
                        {activeTab === 'learning' && 'Skills & Goals'}
                        {activeTab === 'social' && 'Links & Info'}
                      </h3>
                      {!editMode && (
                        <button
                          id="student-profile-edit-toggle"
                          type="button"
                          onClick={() => setEditMode(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                          Edit Profile
                        </button>
                      )}
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                      {/* Tab 1: General Info */}
                      {activeTab === 'general' && (
                        <div className="space-y-4">
                          {editMode ? (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Full Name
                                </label>
                                <input
                                  {...register('name', { 
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                    maxLength: { value: 50, message: 'Name must be at most 50 characters' },
                                    pattern: {
                                      value: /^[a-zA-Z\s'-]+$/,
                                      message: "Name can only contain letters, spaces, hyphens, and apostrophes"
                                    }
                                  })}
                                  className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Headline
                                </label>
                                <input
                                  {...register('headline', {
                                    maxLength: { value: 120, message: 'Headline must be at most 120 characters' }
                                  })}
                                  placeholder="e.g. CS Undergrad @ University | Aspiring Web Developer"
                                  className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.headline ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                />
                                {errors.headline && <p className="text-xs text-red-500 mt-1">{errors.headline.message}</p>}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Bio
                                </label>
                                <textarea
                                  {...register('bio', {
                                    maxLength: { value: 500, message: 'Bio must be at most 500 characters' }
                                  })}
                                  rows={3}
                                  placeholder="Share a quick summary of your background and learning journey..."
                                  className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.bio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                />
                                {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location
                                  </label>
                                  <input
                                    {...register('location', {
                                      maxLength: { value: 100, message: 'Location must be at most 100 characters' }
                                    })}
                                    placeholder="e.g. San Francisco, CA"
                                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                  />
                                  {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Timezone
                                  </label>
                                  <select
                                    {...register('timezone')}
                                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.timezone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                  >
                                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="America/New_York">America/New_York (EST)</option>
                                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                  </select>
                                  {errors.timezone && <p className="text-xs text-red-500 mt-1">{errors.timezone.message}</p>}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-4">
                              {profileData?.bio && (
                                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">About Me</p>
                                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                    {profileData.bio}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                  <Mail size={16} className="text-indigo-500 flex-shrink-0" />
                                  <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                      {profileData?.email}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                  <MapPin size={16} className="text-indigo-500 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {profileData?.location || 'Not specified'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                  <Globe size={16} className="text-indigo-500 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Timezone</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {profileData?.timezone || 'UTC'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                  <Calendar size={16} className="text-indigo-500 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {formatDate(profileData?.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 2: Learning Preferences */}
                      {activeTab === 'learning' && (
                        <div className="space-y-4">
                          {editMode ? (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Interests / Topics (comma-separated)
                                </label>
                                <input
                                  {...register('interestsInput', {
                                    validate: (value) => {
                                      if (!value) return true;
                                      const items = value.split(',').map(s => s.trim()).filter(Boolean);
                                      if (items.length > 20) return 'You can add at most 20 interests';
                                      for (const item of items) {
                                        if (item.length > 50) return `Interest "${item}" exceeds 50 characters`;
                                      }
                                      return true;
                                    }
                                  })}
                                  placeholder="e.g. React, TypeScript, System Design, Machine Learning"
                                  className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.interestsInput ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                />
                                {errors.interestsInput && <p className="text-xs text-red-500 mt-1">{errors.interestsInput.message}</p>}
                              </div>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rank Progression</p>
                                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{profileData?.xp || 0} XP Total</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                  <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 capitalize">
                                    <Award size={14} />
                                    {profileData?.rank || '🥉 Novice'}
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div className={`p-2 rounded border ${(!profileData?.xp || profileData.xp <= 200) ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                      🥉 Novice (0 - 200)
                                    </div>
                                    <div className={`p-2 rounded border ${(profileData?.xp && profileData.xp > 200 && profileData.xp <= 1000) ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                      🥈 Scholar (201 - 1k)
                                    </div>
                                    <div className={`p-2 rounded border ${(profileData?.xp && profileData.xp > 1000 && profileData.xp <= 5000) ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                      🥇 Expert (1k - 5k)
                                    </div>
                                    <div className={`p-2 rounded border ${(profileData?.xp && profileData.xp > 5000) ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                      💎 Master (5k+)
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Interested Topics</p>
                                {profileData?.interests && profileData.interests.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {profileData.interests.map((interest, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium"
                                      >
                                        #{interest}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No topics added yet</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 3: Social & Contact */}
                      {activeTab === 'social' && (
                        <div className="space-y-4">
                          {editMode ? (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Phone Number
                                </label>
                                <input
                                  {...register('phoneNumber', {
                                    validate: (value) => {
                                      if (!value) return true;
                                      const stripped = value.replace(/[\s\-().]/g, '');
                                      if (!/^\+?[1-9]\d{6,14}$/.test(stripped)) {
                                        return 'Must be a valid phone number (e.g. +91 9876543210)';
                                      }
                                      return true;
                                    }
                                  })}
                                  placeholder="+1 (555) 000-0000"
                                  className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                />
                                {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    LinkedIn URL
                                  </label>
                                  <input
                                    {...register('linkedin', {
                                      pattern: {
                                        value: /^https?:\/\/.+\..+/,
                                        message: 'Must be a valid URL'
                                      }
                                    })}
                                    placeholder="https://linkedin.com/in/username"
                                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.linkedin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                  />
                                  {errors.linkedin && <p className="text-xs text-red-500 mt-1">{errors.linkedin.message}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    GitHub URL
                                  </label>
                                  <input
                                    {...register('github', {
                                      pattern: {
                                        value: /^https?:\/\/.+\..+/,
                                        message: 'Must be a valid URL'
                                      }
                                    })}
                                    placeholder="https://github.com/username"
                                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.github ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                  />
                                  {errors.github && <p className="text-xs text-red-500 mt-1">{errors.github.message}</p>}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Personal Website / Portfolio
                                  </label>
                                  <input
                                    {...register('website', {
                                      pattern: {
                                        value: /^https?:\/\/.+\..+/,
                                        message: 'Must be a valid URL'
                                      }
                                    })}
                                    placeholder="https://yourwebsite.com"
                                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.website ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                  />
                                  {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website.message}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Twitter / X URL
                                  </label>
                                  <input
                                    {...register('twitter', {
                                      pattern: {
                                        value: /^https?:\/\/.+\..+/,
                                        message: 'Must be a valid URL'
                                      }
                                    })}
                                    placeholder="https://x.com/username"
                                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 ${errors.twitter ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                  />
                                  {errors.twitter && <p className="text-xs text-red-500 mt-1">{errors.twitter.message}</p>}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                <Phone size={16} className="text-indigo-500 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {profileData?.phoneNumber || 'Not provided'}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {profileData?.socialLinks?.linkedin ? (
                                  <a
                                    href={profileData.socialLinks.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/60 dark:hover:bg-gray-800 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors"
                                  >
                                    <span>LinkedIn</span>
                                    <LinkIcon size={14} />
                                  </a>
                                ) : (
                                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-400">
                                    No LinkedIn added
                                  </div>
                                )}

                                {profileData?.socialLinks?.github ? (
                                  <a
                                    href={profileData.socialLinks.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/60 dark:hover:bg-gray-800 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors"
                                  >
                                    <span>GitHub</span>
                                    <LinkIcon size={14} />
                                  </a>
                                ) : (
                                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-400">
                                    No GitHub added
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Save / Cancel bar when in Edit Mode */}
                      {editMode && (
                        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                          {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Please fix the following errors:</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {Object.values(errors).map((err, i) => (
                                  <li key={i} className="text-xs text-red-500 dark:text-red-400">
                                    {err?.message as string}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => { setEditMode(false); reset(); }}
                              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              id="student-profile-save-all"
                              type="submit"
                              disabled={updateMutation.isPending || Object.keys(errors).length > 0}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {updateMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </form>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
                      {profileData?.profilePicture && (
                        <button
                          id="student-remove-avatar-btn"
                          onClick={() => removeMutation.mutate()}
                          disabled={removeMutation.isPending}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {removeMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Remove photo
                        </button>
                      )}
                      <div className="ml-auto flex items-center gap-3">
                        {profileData?.registeredVia === 'local' && (
                          <button
                            id="student-change-password-btn"
                            onClick={() => setIsChangePasswordOpen(true)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            Change Password
                          </button>
                        )}
                        <button
                          onClick={handleClose}
                          className="px-5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};

export default StudentProfileModal;
