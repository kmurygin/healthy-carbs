import {PaymentStatus} from "./dto/payment-status.enum";

export type ViewState =
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELED'
  | 'PENDING'
  | 'INVALID_ORDER';

export interface PaymentViewData {
  iconType: string;
  iconClasses: string;
  title: string;
  message: string;
  buttonText: string | null;
  buttonLink: string | null;
  buttonClass: string;
}

export const statusToViewState: Record<PaymentStatus, ViewState> = {
  [PaymentStatus.COMPLETED]: 'COMPLETED',
  [PaymentStatus.REJECTED]: 'REJECTED',
  [PaymentStatus.CANCELED]: 'CANCELED',
  [PaymentStatus.PENDING]: 'PENDING',
};

export const baseButtonClass = `
    inline-block w-full rounded-lg px-5 py-3 text-center text-sm
    font-medium text-white focus:outline-none focus:ring-4 hover:cursor-pointer
  `;

export const viewConfig: Record<ViewState, PaymentViewData> = {
  COMPLETED: {
    iconType: 'fa-solid fa-check-circle',
    iconClasses: 'text-emerald-600',
    title: 'Payment Successful!',
    message: 'Thank you for your purchase. Your payment has been processed successfully.',
    buttonText: 'Go to Dashboard',
    buttonLink: '/dashboard',
    buttonClass: `${baseButtonClass} bg-emerald-600 hover:bg-emerald-700 mt-8`
  },
  REJECTED: {
    iconType: 'fa-solid fa-ban',
    iconClasses: 'text-rose-500',
    title: 'Payment Rejected',
    message: 'Your payment was declined.',
    buttonText: 'Choose Another Method',
    buttonLink: '/offers',
    buttonClass: `${baseButtonClass} bg-rose-600 hover:bg-rose-700 mt-4`,
  },
  CANCELED: {
    iconType: 'fa-solid fa-circle-xmark',
    iconClasses: 'text-orange-500',
    title: 'Payment Cancelled',
    message: 'You cancelled the payment before completion.',
    buttonText: 'Back to Offers',
    buttonLink: '/offers',
    buttonClass: `${baseButtonClass} bg-orange-600 hover:bg-orange-700 mt-4`,
  },
  PENDING: {
    iconType: 'fa-solid fa-spinner fa-spin',
    iconClasses: 'text-emerald-500',
    title: 'Processing Payment...',
    message: 'Please wait, we are confirming your payment.',
    buttonText: null,
    buttonLink: null,
    buttonClass: `${baseButtonClass} mt-4`
  },
  INVALID_ORDER: {
    iconType: 'fa-solid fa-exclamation-circle',
    iconClasses: 'text-yellow-500',
    title: 'Invalid Request',
    message: "We couldn't find your order. Please try again.",
    buttonText: 'Back to Offers',
    buttonLink: '/offers',
    buttonClass: `${baseButtonClass} bg-gray-600 hover:bg-gray-700 mt-4`
  },
};
