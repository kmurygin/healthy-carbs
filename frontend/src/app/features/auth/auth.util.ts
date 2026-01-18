export interface ResetPasswordState {
  username?: string;
  otp?: string;
}

export function getButtonClasses() {
  return `
    w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium
    rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none
    focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50
    disabled:cursor-not-allowed transition-colors hover:cursor-pointer
    `
}
