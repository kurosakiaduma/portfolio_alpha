import { useRef, useState } from 'react';
import { ImageOff, Link, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { adminUploadImage } from '../../../lib/adminApi';

interface AdminImageGalleryProps {
    images: string[];
    onChange: (images: string[]) => void;
}

export function AdminImageGallery({ images, onChange }: AdminImageGalleryProps) {
    const [addingUrl, setAddingUrl] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddUrl = () => {
        const trimmed = urlInput.trim();
        if (trimmed) {
            onChange([...images, trimmed]);
        }
        setUrlInput('');
        setAddingUrl(false);
    };

    const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddUrl();
        } else if (e.key === 'Escape') {
            setUrlInput('');
            setAddingUrl(false);
        }
    };

    const handleRemove = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        try {
            const result = await adminUploadImage(file);
            onChange([...images, result.url]);
        } catch (err: any) {
            setUploadError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {/* Thumbnail strip */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {images.map((url, i) => (
                        <GalleryThumb
                            key={i}
                            url={url}
                            onRemove={() => handleRemove(i)}
                        />
                    ))}
                </div>
            )}

            {/* URL input slot */}
            {addingUrl && (
                <div className="flex gap-2">
                    <input
                        type="url"
                        autoFocus
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={handleUrlKeyDown}
                        onBlur={handleAddUrl}
                        placeholder="https://example.com/screenshot.png"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                </div>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => setAddingUrl(true)}
                    disabled={addingUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-xs transition disabled:opacity-40"
                >
                    <Link size={12} /> Add Image URL
                </button>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-xs transition disabled:opacity-40"
                >
                    {uploading ? (
                        <><Loader2 size={12} className="animate-spin" /> Uploading...</>
                    ) : (
                        <><Upload size={12} /> Upload Image</>
                    )}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleUpload}
                    className="hidden"
                />
            </div>

            {uploadError && (
                <p className="text-xs text-red-400">{uploadError}</p>
            )}

            {images.length === 0 && !addingUrl && (
                <p className="text-xs text-slate-500 italic">No additional images yet. Add a URL or upload a file.</p>
            )}
        </div>
    );
}

/* Individual thumbnail with remove overlay */
function GalleryThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
    const [broken, setBroken] = useState(false);

    return (
        <div className="relative group w-20 h-14 rounded-md overflow-hidden border border-slate-700 flex-shrink-0">
            {broken ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                    <ImageOff size={16} />
                </div>
            ) : (
                <img
                    src={url}
                    alt="Project image"
                    onError={() => setBroken(true)}
                    className="w-full h-full object-cover"
                />
            )}
            <button
                type="button"
                onClick={onRemove}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Remove image"
            >
                <Trash2 size={14} className="text-red-400" />
            </button>
        </div>
    );
}
