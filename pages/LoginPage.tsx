import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/apiMock';
import { getPasswordSettings } from '../src/services/settings';
import { verifyPassword } from '../src/utils/password';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // Try Supabase authentication first
            const passwordSettings = await getPasswordSettings();
            if (passwordSettings?.password_hash) {
                const isValidPassword = await verifyPassword(password, passwordSettings.password_hash);
                if (isValidPassword) {
                    // Create a user object for successful login
                    const user: User = {
                        id: 'admin-1',
                        email: email,
                        fullName: 'Admin CKFG',
                        role: 'Management'
                    };
                    onLoginSuccess(user);
                    return;
                } else {
                    setError('Invalid email or password.');
                    return;
                }
            } else {
                // No password set in Supabase yet
                setError('No password has been set. Please set a password in admin settings first.');
                return;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const svgPattern = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><defs><g id="icon-leaf" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20C18 16 20 10 20 2" /><path d="M10 20C2 16 0 10 0 2" /></g><g id="icon-flower" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2" /><path d="M10 8V2" /><path d="M10 12v6" /><path d="M8 10H2" /><path d="M12 10h6" /><path d="m15.6 15.6-4.2-4.2" /><path d="m4.4 4.4 4.2 4.2" /><path d="m15.6 4.4-4.2 4.2" /><path d="m4.4 15.6 4.2-4.2" /></g><g id="icon-mushroom" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10a8 8 0 1 1 16 0Z" /><path d="M10 10v8" /></g><g id="icon-pine" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m10 2 8 8-4-2-4 4-4-4-4 2 8-8Z"/><path d="m6 10 4 4 4-4"/><path d="M10 14v6"/></g></defs><g opacity="0.1"><use href="#icon-leaf" x="30" y="50" transform="rotate(20 30 50) scale(0.8)" /><use href="#icon-flower" x="150" y="80" transform="scale(0.7)" /><use href="#icon-pine" x="250" y="40" transform="scale(1.1)" /><use href="#icon-mushroom" x="80" y="150" transform="rotate(-15 80 150) scale(0.9)" /><use href="#icon-leaf" x="320" y="120" transform="rotate(120 320 120) scale(1.2)" /><use href="#icon-pine" x="40" y="250" transform="scale(0.9)" /><use href="#icon-flower" x="220" y="210" transform="rotate(45 220 210) scale(1.0)" /><use href="#icon-mushroom" x="350" y="280" transform="scale(0.8)" /><use href="#icon-leaf" x="120" y="330" transform="rotate(-40 120 330)" /><use href="#icon-pine" x="180" y="350" transform="scale(0.7)" /><use href="#icon-flower" x="280" y="180" transform="scale(0.6)" /><use href="#icon-mushroom" x="20" y="10" transform="rotate(10 20 10) scale(1.1)" /><use href="#icon-leaf" x="200" y="10" transform="rotate(180 200 10)" /><use href="#icon-pine" x="360" y="20" transform="scale(0.8)" /><use href="#icon-flower" x="380" y="200" transform="scale(0.9)" /><use href="#icon-leaf" x="10" y="380" transform="rotate(90 10 380)" /><use href="#icon-mushroom" x="290" y="390" transform="rotate(-30 290 390) scale(1.0)" /></g></svg>`;
    const encodedSvg = encodeURIComponent(svgPattern.replace(/\s+/g, ' '));
    const backgroundStyle = { backgroundImage: `url("data:image/svg+xml,${encodedSvg}")` };
    
    const toucanImageDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIbGNtcwIQAABtbnRyUkdCIFhZWiAH4gADABQACQAOAB1hY3NwTVNGVAAAAABzYXdzY3RybAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWhhbmSdkQA9AAAAAANobgMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAF9jcHJ0AAABDAAAAAx3dHB0AAABGAAAABRyWFlaAAABLAAAABRnWFlaAAABQAAAABRiWFlaAAABVAAAABRyVFJDAAABaAAAAA5jaGFkAAABsAAAACxiVFJDAAABaAAAAA5nVFJDAAABaAAAAA5kZXNjAAAAAAAAABRnZW5lcmljIFJHQiBwcm9maWxlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAUAAAAHABEAGUAbgBlAHIAaQBjACAAUgBHAEIAIABwAHIAbwBmAGkAbABlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYWVogAAAAAAAA81EAAQAAAAADzQxYWVogAAAAAAAAb6IAAD9s…";

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={backgroundStyle}>
                <img src="https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=2825&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Vibrant toucan in a lush rainforest" className="w-full h-48 object-cover" />
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-green-900 mb-6 text-center">CKFG Management Team</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-green-100 text-black p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-green-100 text-black p-2"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
