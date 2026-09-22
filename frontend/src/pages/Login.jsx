import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useCart } from '../context/CartContext.jsx';
import { Store, Loader2, LogIn } from 'lucide-react';

export const Login = () => {
  const { loginWithGoogle } = useCart();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await loginWithGoogle(credentialResponse.credential);
      if (!success) {
        setError('Failed to log in with Google. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-100 rounded-full">
            <Store className="w-10 h-10 text-amber-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">CRACKERS ENGINE</h1>
        <p className="text-slate-500 text-sm mb-8 font-medium">Please sign in to access your shop's dashboard and billing engine.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold mb-6 text-left border border-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2 text-slate-500 py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold text-sm">Authenticating...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google login failed.')}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
                text="signin_with"
                width="100%"
              />
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
          Multi-Shop Billing Engine • Powered by Google Authentication
        </div>
      </div>
    </div>
  );
};

export default Login;
