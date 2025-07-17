import { toast, ToastOptions, ToastPosition } from 'react-toastify';

interface UseToastOptions extends Omit<ToastOptions, 'type'> {
    position?: ToastPosition;
    autoClose?: number;
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
}

export const useToast = () => {
    const defaultOptions: UseToastOptions = {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    const showToast = (message: string, options?: UseToastOptions) => {
        return toast(message, { ...defaultOptions, ...options });
    };

    const showSuccess = (message: string, options?: UseToastOptions) => {
        return toast.success(message, { ...defaultOptions, ...options });
    };

    const showError = (message: string, options?: UseToastOptions) => {
        return toast.error(message, { ...defaultOptions, ...options });
    };

    const showWarning = (message: string, options?: UseToastOptions) => {
        return toast.warning(message, { ...defaultOptions, ...options });
    };

    const showInfo = (message: string, options?: UseToastOptions) => {
        return toast.info(message, { ...defaultOptions, ...options });
    };

    const showPromise = <T>(
        promise: Promise<T>,
        messages: {
            pending: string;
            success: string;
            error: string;
        },
        options?: UseToastOptions
    ) => {
        return toast.promise(promise, messages, { ...defaultOptions, ...options });
    };

    const dismiss = (toastId?: string | number) => {
        toast.dismiss(toastId);
    };

    const dismissAll = () => {
        toast.dismiss();
    };

    return {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showPromise,
        dismiss,
        dismissAll,
    };
};