import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../src/supabase-client';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
}

// List of authorized admin email addresses
const AUTHORIZED_ADMIN_EMAILS = [
    'stefan.gravesande@preqal.org',
    'ritchiegoring@gmail.com',
    // Add more emails here as needed
];

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthSuccess = useCallback(async (supabaseUser: any) => {
        try {
            const userEmail = supabaseUser.email || '';
            
            // Check if the user's email is in the authorized list
            if (!AUTHORIZED_ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
                // Sign out the unauthorized user
                await supabase.auth.signOut();
                setError(`Access denied. The email ${userEmail} is not authorized to access the management panel.`);
                setIsLoading(false);
                return;
            }
            
            // Create user object from Supabase auth user
            const user: User = {
                id: supabaseUser.id,
                email: userEmail,
                fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Admin User',
                role: 'Management' // All Google-authenticated users are treated as Management
            };
            
            onLoginSuccess(user);
        } catch (err) {
            console.error('Auth success handler error:', err);
            setError('Failed to complete login. Please try again.');
            setIsLoading(false);
        }
    }, [onLoginSuccess]);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setIsLoading(true);
                    await handleAuthSuccess(session.user);
                }
            } catch (err) {
                console.error('Session check error:', err);
                setIsLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setIsLoading(true);
                await handleAuthSuccess(session.user);
            } else if (event === 'SIGNED_OUT') {
                setError('');
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [handleAuthSuccess]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            // Construct redirect URL - include base path for GitHub Pages
            const basePath = '/ck-forest-gardens-booking-app';
            const redirectPath = window.location.pathname.startsWith(basePath) 
                ? window.location.pathname 
                : `${basePath}${window.location.pathname}`;
            const redirectTo = `${window.location.origin}${redirectPath}`;
            
            const { error: signInError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (signInError) {
                console.error('Google sign-in error:', signInError);
                setError('Failed to sign in with Google. Please try again.');
                setIsLoading(false);
            }
            // Note: We don't set isLoading to false here because the redirect will happen
            // The session will be handled by onAuthStateChange or checkSession
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const svgPattern = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><defs><g id="icon-leaf" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20C18 16 20 10 20 2" /><path d="M10 20C2 16 0 10 0 2" /></g><g id="icon-flower" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2" /><path d="M10 8V2" /><path d="M10 12v6" /><path d="M8 10H2" /><path d="M12 10h6" /><path d="m15.6 15.6-4.2-4.2" /><path d="m4.4 4.4 4.2 4.2" /><path d="m15.6 4.4-4.2 4.2" /><path d="m4.4 15.6 4.2-4.2" /></g><g id="icon-mushroom" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10a8 8 0 1 1 16 0Z" /><path d="M10 10v8" /></g><g id="icon-pine" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m10 2 8 8-4-2-4 4-4-4-4 2 8-8Z"/><path d="m6 10 4 4 4-4"/><path d="M10 14v6"/></g></defs><g opacity="0.1"><use href="#icon-leaf" x="30" y="50" transform="rotate(20 30 50) scale(0.8)" /><use href="#icon-flower" x="150" y="80" transform="scale(0.7)" /><use href="#icon-pine" x="250" y="40" transform="scale(1.1)" /><use href="#icon-mushroom" x="80" y="150" transform="rotate(-15 80 150) scale(0.9)" /><use href="#icon-leaf" x="320" y="120" transform="rotate(120 320 120) scale(1.2)" /><use href="#icon-pine" x="40" y="250" transform="scale(0.9)" /><use href="#icon-flower" x="220" y="210" transform="rotate(45 220 210) scale(1.0)" /><use href="#icon-mushroom" x="350" y="280" transform="scale(0.8)" /><use href="#icon-leaf" x="120" y="330" transform="rotate(-40 120 330)" /><use href="#icon-pine" x="180" y="350" transform="scale(0.7)" /><use href="#icon-flower" x="280" y="180" transform="scale(0.6)" /><use href="#icon-mushroom" x="20" y="10" transform="rotate(10 20 10) scale(1.1)" /><use href="#icon-leaf" x="200" y="10" transform="rotate(180 200 10)" /><use href="#icon-pine" x="360" y="20" transform="scale(0.8)" /><use href="#icon-flower" x="380" y="200" transform="scale(0.9)" /><use href="#icon-leaf" x="10" y="380" transform="rotate(90 10 380)" /><use href="#icon-mushroom" x="290" y="390" transform="rotate(-30 290 390) scale(1.0)" /></g></svg>`;
    const encodedSvg = encodeURIComponent(svgPattern.replace(/\s+/g, ' '));
    const backgroundStyle = { backgroundImage: `url("data:image/svg+xml,${encodedSvg}")` };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={backgroundStyle}>
                <img src="https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=2825&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Vibrant toucan in a lush rainforest" className="w-full h-48 object-cover" />
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-green-900 mb-2 text-center">CKFG Management Team</h1>
                    <p className="text-sm text-gray-600 mb-6 text-center">Sign in with your Google account</p>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    <p className="mt-4 text-xs text-gray-500 text-center">
                        Only authorized Google accounts can access the management panel.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
