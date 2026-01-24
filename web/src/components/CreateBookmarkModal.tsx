import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/api';

interface CreateBookmarkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateBookmarkModal({ open, onOpenChange, onSuccess }: CreateBookmarkModalProps) {
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState(''); // Comma separated for now
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
            await apiRequest('/bookmarks', {
                method: 'POST',
                body: JSON.stringify({ url, tags: tagList }),
            });
            onSuccess();
            onOpenChange(false);
            setUrl('');
            setTags('');
        } catch (error) {
            console.error(error);
            alert('Failed to create bookmark');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Bookmark</DialogTitle>
                    <DialogDescription>
                        Paste a URL to save it. We'll fetch the title automatically.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Work, Research"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
