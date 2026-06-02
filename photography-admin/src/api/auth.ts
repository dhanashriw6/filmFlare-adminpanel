import apiClient from './client';

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface VerifyOtpPayload {
  email?: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email?: string;
}

export interface ResetPasswordPayload {
  new_password: string;
  reset_token: string;
  
}

export interface RefreshToken {
  refresh_token:string
}

/**
 * Log in to the application.
 * Can be used with email/password or phone/password payloads.
 */
export const login = async (payload: LoginPayload) => {
  return await apiClient.post('/admin/login', payload);
};

/**
 * Send OTP for forgot password flow.
 */
export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  return await apiClient.post('/admin/forgot_password', payload);
};

/**
 * Reset password using the received OTP and new password.
 */
export const resetPassword = async (payload: ResetPasswordPayload) => {
  return await apiClient.post('/admin/reset_password', payload);
};

/**
 * Verify the OTP sent to user.
 */
export const verifyOtp = async (payload: VerifyOtpPayload) => {
  return await apiClient.post('/admin/verify_otp', payload);
};
export const refreshToken = async (payload: RefreshToken) => {
  return await apiClient.post('/admin/refresh_token', payload);
};
