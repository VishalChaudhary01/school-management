import { getSession, signIn } from 'next-auth/react';
import { LabelledInput } from './addSchool';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Check if user is already signed in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async (email) => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (result.success) {
        setOtpSent(true);
        setEmail(email);
        setCountdown(60); // 60 seconds countdown
        toast.success(result.message);
        return true;
      } else {
        toast.error(result.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Something went wrong please try again!');
      return false;
    }
  };

  const onSendOTP = async (data) => {
    if (!data.email) {
      toast.error('Please enter your email address');
      return false;
    }
    setIsSubmitting(true);
    await sendOTP(data.email);
    setIsSubmitting(false);
  };

  const onVerifyOTP = async (data) => {
    if (!data.otp) {
      toast.error('Please enter the OTP');
      return;
    }

    if (data.otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await signIn('verificationToken', {
        email,
        otp: data.otp,
        redirect: false,
        callbackUrl: router.query.callbackUrl || '/',
      });

      if (response.ok) {
        toast.success('Successfully signed in!');
        router.push(response.url || '/');
      } else {
        toast.error(response.error || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;

    setIsSubmitting(true);
    const success = await sendOTP(email);
    if (success) {
      setCountdown(60);
    }
    setIsSubmitting(false);
  };

  const goBack = () => {
    setOtpSent(false);
    setEmail('');
    setCountdown(0);
    reset();
  };

  if (!otpSent) {
    return (
      <div className="flex flex-col items-center justify-center w-full md:max-w-[560px] mx-auto min-h-screen py-6 p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">Sign In</h1>
        <p className="text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you a verification code
        </p>

        <form
          onSubmit={handleSubmit(onSendOTP)}
          className="flex flex-col gap-4 w-full"
        >
          <LabelledInput
            name="email"
            label="Email Address"
            type="email"
            register={register}
            required
            error={errors.email}
            placeholder="your-email@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">
              Please enter a valid email address
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isSubmitting ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full md:max-w-[560px] mx-auto min-h-screen py-6 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">
        Verify Your Email
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        We've sent a 6-digit verification code to <strong>{email}</strong>
      </p>

      <form
        onSubmit={handleSubmit(onVerifyOTP)}
        className="flex flex-col gap-4 w-full"
      >
        <div className="relative">
          <LabelledInput
            name="otp"
            label="Verification Code"
            type="text"
            register={register}
            required
            error={errors.otp}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          {errors.otp && (
            <p className="text-red-500 text-sm">
              Please enter the 6-digit code
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
        </button>
      </form>

      <div className="flex flex-col items-center gap-3 mt-6">
        <button
          onClick={resendOTP}
          disabled={countdown > 0 || isSubmitting}
          className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 text-sm"
        >
          {countdown > 0
            ? `Resend code in ${countdown}s`
            : 'Resend verification code'}
        </button>

        <button
          onClick={goBack}
          className="text-gray-600 hover:text-gray-700 text-sm underline"
        >
          Use different email
        </button>
      </div>
    </div>
  );
}
