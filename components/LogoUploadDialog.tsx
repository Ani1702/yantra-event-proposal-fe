'use client';

import { useState } from 'react';
import { getValidAccessToken } from '@/lib/supabase';

interface LogoUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    proposalId: string;
    onSuccess: (logoUrl: string) => void;
}

export default function LogoUploadDialog({ isOpen, onClose, proposalId, onSuccess }: LogoUploadDialogProps) {
    const [logoUrl, setLogoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const accessToken = await getValidAccessToken();
            if (!accessToken) {
                setError('Session expired. Please sign in again.');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/upload-logo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ proposalId, logoUrl }),
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess(logoUrl);
                onClose();
                setLogoUrl('');
            } else {
                setError(data.message || 'Failed to upload logo');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black w-full max-w-md p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-4">Add Logo</h2>

                <div className="mb-4 text-sm text-gray-700">
                    <p className="mb-2">Please upload your logo to <a href="https://uploadimgur.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">uploadimgur.com</a></p>
                    <p>Once uploaded, copy the direct image link and paste it below.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2">
                            Logo URL
                        </label>
                        <input
                            type="url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://i.imgur.com/..."
                            className="w-full px-3 py-2 border-2 border-black text-sm"
                            required
                        />
                    </div>

                    {error && (
                        <div className="mb-4 text-xs text-red-600 font-bold">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-bold uppercase text-xs hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-black text-white border-2 border-black font-bold uppercase text-xs hover:bg-white hover:text-black disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Logo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
