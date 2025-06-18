import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const EmailConfirm = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        console.log('🔍 Email Confirm Page - Current URL:', window.location.href);
        
        // Extract tokens/code from URL
        const url = new URL(window.location.href);
        const accessToken = url.searchParams.get('access_token') || url.hash.match(/access_token=([^&]+)/)?.[1];
        const refreshToken = url.searchParams.get('refresh_token') || url.hash.match(/refresh_token=([^&]+)/)?.[1];
        const confirmationCode = url.searchParams.get('code');
        const type = url.searchParams.get('type') || url.hash.match(/type=([^&]+)/)?.[1];

        console.log('🔍 Email Confirm - Parameters:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasCode: !!confirmationCode,
          type,
          code: confirmationCode ? confirmationCode.substring(0, 8) + '...' : null
        });

        // Handle different confirmation formats
        if (accessToken && refreshToken) {
          // Format 1: Direct tokens in URL
          console.log('✅ Using direct tokens method...');
          setMessage('Setting up your account...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('❌ Session error:', error);
            throw error;
          }

          console.log('✅ Email confirmed for user:', data.user?.id);
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting...');
          
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);

        } else if (confirmationCode) {
          // Format 2: Confirmation code (more common with email confirmations)
          console.log('✅ Using confirmation code method...');
          setMessage('Verifying your email confirmation...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: confirmationCode,
            type: 'email'
          });

          if (error) {
            console.error('❌ OTP verification error:', error);
            throw error;
          }

          if (data.user) {
            console.log('✅ Email confirmed for user:', data.user.id);
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting...');
            
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          } else {
            throw new Error('Email confirmation succeeded but no user returned');
          }

        } else {
          console.log('❌ No valid confirmation parameters found');
          setStatus('error');
          setMessage('Invalid confirmation link. Please try again or request a new confirmation email.');
        }

      } catch (error) {
        console.error('❌ Email confirmation error:', error);
        setStatus('error');
        setMessage(`Confirmation failed: ${error.message}`);
      }
    };

    // Start confirmation process
    confirmEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-lg p-8 text-center text-white">
          
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            )}
            {status === 'success' && (
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="h-12 w-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4 text-emerald-400">
            {status === 'processing' && '📧 Confirming Email'}
            {status === 'success' && '✅ Email Confirmed!'}
            {status === 'error' && '❌ Confirmation Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-300 mb-6">{message}</p>

          {/* Action Buttons */}
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Register Again
              </button>
            </div>
          )}

          {status === 'success' && (
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Continue to Dashboard
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmailConfirm; 