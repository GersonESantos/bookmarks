import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreateBookmarkModal } from '@/components/CreateBookmarkModal';
import { apiRequest } from '@/lib/api';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface Bookmark {
    _id: string;
    title: string;
    url: string;
    tags: { _id: string, name: string }[];
    createdAt: string;
    source?: string;
}

export default function Home() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    const fetchBookmarks = async () => {
        try {
            const q = search ? `?search=${encodeURIComponent(search)}` : '';
            const data = await apiRequest(`/bookmarks${q}`);
            setBookmarks(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, [search]); // Debounce would be better

    const handleDelete = async (id: string) => {
        if (!confirm("Delete?")) return;
        await apiRequest(`/bookmarks/${id}`, { method: 'DELETE' });
        fetchBookmarks();
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Bookmarks</h1>
                <Button onClick={() => setIsModalOpen(true)}>New Bookmark</Button>
            </div>

            <div className="flex gap-4 mb-6">
                <Input
                    placeholder="Search bookmarks..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">URL</th>
                            <th className="p-4 font-medium">Tags</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookmarks.map((bookmark) => (
                            <tr key={bookmark._id} className="border-t hover:bg-muted/50 transition-colors">
                                <td className="p-4 font-medium">{bookmark.title || 'No Title'}</td>
                                <td className="p-4 text-muted-foreground truncate max-w-[200px]">
                                    <a href={bookmark.url} target="_blank" rel="noreferrer" className="hover:underline">
                                        {bookmark.url}
                                    </a>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1 flex-wrap">
                                        {bookmark.tags?.map(tag => (
                                            <span key={tag._id} className="bg-secondary px-2 py-0.5 rounded text-xs">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {format(new Date(bookmark.createdAt), 'MMM d, yyyy')}
                                </td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(bookmark._id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                        {bookmarks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-muted-foreground">No bookmarks found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CreateBookmarkModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={fetchBookmarks}
            />
        </div>
    );
}
