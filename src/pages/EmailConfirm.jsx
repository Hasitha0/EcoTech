import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const EmailConfirm = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        console.log('🔍 Email Confirm Page - Current URL:', window.location.href);
        
        // Extract tokens from URL
        const url = new URL(window.location.href);
        const accessToken = url.searchParams.get('access_token') || url.hash.match(/access_token=([^&]+)/)?.[1];
        const refreshToken = url.searchParams.get('refresh_token') || url.hash.match(/refresh_token=([^&]+)/)?.[1];
        const type = url.searchParams.get('type') || url.hash.match(/type=([^&]+)/)?.[1];

        console.log('🔍 Email Confirm - Tokens:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type
        });

        if (accessToken && refreshToken) {
          console.log('✅ Setting session...');
          setMessage('Setting up your account...');
          
          // Set the session
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
          
          // Clean URL and redirect
          setTimeout(() => {
            // Try to redirect to a clean URL
            if (window.opener) {
              // If opened in popup/new tab, try to communicate with parent
              try {
                window.opener.postMessage('email-confirmed', '*');
                window.close();
              } catch (e) {
                // If that fails, redirect
                window.location.href = '/dashboard';
              }
            } else {
              // Normal redirect
              window.location.href = '/dashboard';
            }
          }, 2000);

        } else {
          console.log('❌ No tokens found in URL');
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