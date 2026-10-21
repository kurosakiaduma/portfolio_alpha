import { useRef, useState } from 'react';
import { Link, Upload, ImageOff, Loader2 } from 'lucide-react';
import { adminUploadImage } from '../../../lib/adminApi';

interface CoverImageInputProps {
    value: string;
    onChange: (url: string) => void;
}

type InputMode = 'url' | 'upload';

export function CoverImageInput({ value, onChange }: CoverImageInputProps) {
    const [mode, setMode] = useState<InputMode>('url');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [imgBroken, setImgBroken] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const inputClass =
        'w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200 ' +
        'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-sm';

    const handleModeSwitch = (next: InputMode) => {
        setMode(next);
        setUploadError(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        try {
            const result = await adminUploadImage(file);
            onChange(result.url);
            setImgBroken(false);
        } catch (err: any) {
            setUploadError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            // reset input so the same file can be re-selected after an error
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {/* Toggle */}
            <div className="flex rounded-md overflow-hidden border border-slate-700 w-fit">
                <button
                    type="button"
                    onClick={() => handleModeSwitch('url')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        mode === 'url'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <Link size={12} /> URL
                </button>
                <button
                    type="button"
                    onClick={() => handleModeSwitch('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        mode === 'upload'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <Upload size={12} /> Upload
                </button>
            </div>

            {/* URL input */}
            {mode === 'url' && (
                <input
                    type="url"
                    value={value}
                    onChange={e => {
                        onChange(e.target.value);
                        setImgBroken(false);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                />
            )}

            {/* File upload */}
            {mode === 'upload' && (
                <div className="space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cover-image-file"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-md text-sm transition disabled:opacity-50"
                    >
                        {uploading ? (
                            <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                        ) : (
                            <><Upload size={14} /> Choose image</>
                        )}
                    </button>
                    {uploadError && (
                        <p className="text-xs text-red-400">{uploadError}</p>
                    )}
                </div>
            )}

            {/* Thumbnail preview */}
            {value && (
                <div className="mt-2">
                    {imgBroken ? (
                        <div className="w-32 h-20 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-md text-slate-500">
                            <ImageOff size={20} />
                        </div>
                    ) : (
                        <img
                            src={value}
                            alt="Cover preview"
                            onError={() => setImgBroken(true)}
                            className="w-32 h-20 object-cover rounded-md border border-slate-700"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
