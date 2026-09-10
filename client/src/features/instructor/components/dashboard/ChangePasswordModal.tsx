import React, { useState } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { changeInstructorPassword } from '../../services/InstructorDashboardService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const PasswordField: React.FC<{
  id: string;
  label: string;
  placeholder: string;
  registration: ReturnType<ReturnType<typeof useForm<ChangePasswordFormData>>['register']>;
  error?: string | undefined;
}> = ({ id, label, placeholder, registration, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Lock size={15} className="text-gray-400" />
        </div>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          {...registration}
          className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
            ${error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
              : 'border-gray-300 dark:border-gray-600'
            }`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({ mode: 'onChange' });

  const newPassword = watch('newPassword', '');

  const mutation = useMutation({
    mutationFn: changeInstructorPassword,
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Password changed successfully');
      reset();
      onClose();
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to change password';
      toast.error(msg);
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    reset();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-250"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all">
                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                        <ShieldCheck size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                        Change Password
                      </Dialog.Title>
                    </div>
                    <button
                      id="instructor-change-password-modal-close"
                      type="button"
                      onClick={handleClose}
                      disabled={mutation.isPending}
                      className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your current password and choose a strong new password to keep your account secure.
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Current Password */}
                    <PasswordField
                      id="instructor-current-password"
                      label="Current Password"
                      placeholder="Your current password"
                      registration={register('currentPassword', {
                        required: 'Current password is required',
                      })}
                      error={errors.currentPassword?.message}
                    />

                    {/* New Password */}
                    <PasswordField
                      id="instructor-new-password"
                      label="New Password"
                      placeholder="At least 8 characters"
                      registration={register('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 8, message: 'Minimum 8 characters' },
                        pattern: {
                          value: PASSWORD_REGEX,
                          message:
                            'Must include uppercase, lowercase, number and special character (@$!%*?&)',
                        },
                      })}
                      error={errors.newPassword?.message}
                    />

                    {/* Confirm Password */}
                    <PasswordField
                      id="instructor-confirm-password"
                      label="Confirm New Password"
                      placeholder="Repeat new password"
                      registration={register('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: (val) =>
                          val === newPassword || 'Passwords do not match',
                      })}
                      error={errors.confirmPassword?.message}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <button
                        id="instructor-change-password-cancel"
                        type="button"
                        onClick={handleClose}
                        disabled={mutation.isPending}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        id="instructor-change-password-submit"
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Updating…
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ChangePasswordModal;
