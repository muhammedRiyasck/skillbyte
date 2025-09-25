import { Fragment } from "react";
import type { ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  children?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  children,
}: BaseModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100"
                  >
                    {title}
                  </Dialog.Title>
                )}

                {/* Custom content */}
                <div className="mt-4">{children}</div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={onClose}
                  >
                    {cancelLabel}
                  </button>
                  {onConfirm && (
                    <button
                      type="button"
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 cursor-pointer"
                      onClick={onConfirm}
                    >
                      {confirmLabel}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
