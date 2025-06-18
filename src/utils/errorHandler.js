// Error handling utilities for production debugging
export class ErrorHandler {
  static logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'
    };
    
    console.error('EcoTech Error:', errorInfo);
    
    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to your logging service
      // logToService(errorInfo);
    }
    
    return errorInfo;
  }
  
  static handleAuthError(error, context = 'Authentication') {
    let userMessage = 'An authentication error occurred. Please try again.';
    
    switch (error.message) {
      case 'Invalid login credentials':
        userMessage = 'Invalid email or password. Please check your credentials and try again.';
        break;
      case 'Email not confirmed':
        userMessage = 'Please check your email and click the confirmation link before signing in.';
        break;
      case 'Too many requests':
        userMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        break;
      case 'Network request failed':
        userMessage = 'Network connection error. Please check your internet connection and try again.';
        break;
      default:
        if (error.message.includes('fetch')) {
          userMessage = 'Connection error. Please check your network and try again.';
        }
        break;
    }
    
    this.logError(error, context);
    return userMessage;
  }
  
  static async testSupabaseConnection() {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Supabase connection test successful');
      return { success: true, message: 'Connected successfully' };
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      return { 
        success: false, 
        message: error.message,
        details: this.logError(error, 'Supabase Connection Test')
      };
    }
  }
  
  static getEnvironmentInfo() {
    return {
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      vercelEnv: process.env.VERCEL_ENV,
      isVercel: !!process.env.VERCEL,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'
    };
  }
}

// Network connectivity check
export const checkNetworkConnectivity = async () => {
  try {
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    return response.ok;
  } catch (error) {
    console.warn('Network connectivity check failed:', error);
    return false;
  }
};

// Supabase specific debugging
export const debugSupabaseAuth = async () => {
  try {
    const { supabase } = await import('../lib/supabase');
    
    // Test 1: Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session test:', { sessionData, sessionError });
    
    // Test 2: Check user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('User test:', { userData, userError });
    
    // Test 3: Check connection
    const connectionTest = await ErrorHandler.testSupabaseConnection();
    console.log('Connection test:', connectionTest);
    
    return {
      session: { data: sessionData, error: sessionError },
      user: { data: userData, error: userError },
      connection: connectionTest,
      environment: ErrorHandler.getEnvironmentInfo()
    };
  } catch (error) {
    ErrorHandler.logError(error, 'Supabase Debug');
    return { error: error.message };
  }
}; 