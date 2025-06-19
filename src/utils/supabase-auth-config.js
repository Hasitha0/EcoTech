// Supabase Auth Configuration Utility
// This script helps configure the correct authentication settings for production

import { PROJECT_CONFIG, getAuthConfig } from '../lib/supabase-config.js';

/**
 * Get the required Supabase authentication configuration
 * These settings need to be updated in the Supabase Dashboard
 */
export const getRequiredAuthSettings = () => {
  const config = getAuthConfig();
  
  return {
    siteUrl: config.domain,
    redirectUrls: [
      `${config.domain}/auth/callback`,
      `${config.domain}/confirm`,
      `${config.domain}/auth/confirm`,
      // Keep localhost for development
      'http://localhost:5173/auth/callback',
      'http://localhost:5173/confirm',
      'http://localhost:3000/auth/callback',
      'http://localhost:3000/confirm'
    ],
    projectId: PROJECT_CONFIG.PROJECT_ID,
    supabaseUrl: PROJECT_CONFIG.SUPABASE_URL,
    currentDomain: config.domain
  };
};

/**
 * Display the configuration that needs to be set in Supabase Dashboard
 */
export const displayAuthConfiguration = () => {
  const settings = getRequiredAuthSettings();
  
  console.log('=== SUPABASE AUTH CONFIGURATION REQUIRED ===');
  console.log('Please update these settings in your Supabase Dashboard:');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + settings.projectId + '/auth/url-configuration');
  console.log('');
  console.log('2. Update Site URL to:');
  console.log('   ' + settings.siteUrl);
  console.log('');
  console.log('3. Update Redirect URLs to include:');
  settings.redirectUrls.forEach(url => {
    console.log('   ' + url);
  });
  console.log('');
  console.log('4. For email templates, update the redirect URL to:');
  console.log('   ' + settings.currentDomain + '/confirm?code={{ .TokenHash }}');
  console.log('');
  console.log('Current domain detected:', settings.currentDomain);
  console.log('===============================================');
  
  return settings;
};

/**
 * Validate current authentication configuration
 */
export const validateAuthConfig = async () => {
  const config = getAuthConfig();
  
  console.log('Validating authentication configuration...');
  console.log('Current domain:', config.domain);
  console.log('Redirect URL:', config.redirectUrl);
  console.log('Confirm URL:', config.confirmUrl);
  
  // Check if we're in the right environment
  if (config.domain.includes('localhost')) {
    console.warn('WARNING: Running on localhost - email confirmations will redirect to localhost');
    return false;
  }
  
  if (config.domain.includes('vercel')) {
    console.log('✅ Running on Vercel production environment');
    return true;
  }
  
  console.log('ℹ️ Running on custom domain:', config.domain);
  return true;
};

// Auto-display configuration when this module is imported in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('Development mode detected - Auth configuration info:');
  displayAuthConfiguration();
} 