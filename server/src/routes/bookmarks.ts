import { Router, Request, Response } from 'express';
import { BookmarkModel } from '../models/Bookmark';
import { TagModel } from '../models/Tag';
import { isValidUrl } from '@bookmark/shared';

const router = Router();

// Middleware to get userId from request (populated by authmiddleware)
// For now, we'll extract it again or assume it's on req.user
// We need a proper middleware. I'll define a simple one here or import.
import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

const requireAuth = async (req: Request, res: Response, next: Function) => {
    const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        (req as any).user = { id: decoded.userId };
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { category, search } = req.query;

    let query: any = { ownerId: userId };

    if (category) {
        // Find tag id by name
        // Or if 'category' is passed as name?
        // Prompt says "User can filter bookmarks per category".
        // Assuming category is a Tag Name.
        const tag = await TagModel.findOne({ ownerId: userId, name: category });
        if (tag) {
            query.tags = tag._id.toString(); // Search by Tag ID
            // Wait, Bookmark.tags stores strings or IDs?
            // "BookmarkTag (join table)" logic implies IDs.
            // Model says "tags: [{ type: String }]". I'll assume it stores Tag IDs (ObjectIds as strings).
        } else {
            // If tag not found, and we filtered by it, return empty?
            return res.json([]);
        }
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { notes: { $regex: search, $options: 'i' } },
            { source: { $regex: search, $options: 'i' } }
        ];
    }

    try {
        const bookmarks = await BookmarkModel.find(query).sort({ createdAt: -1 });
        // We might want to populate tags to show names
        // But for list, maybe we just need IDs? Or names?
        // Let's populate manually or use aggregation if needed. 
        // For simplicity:
        const bookmarksWithTags = await Promise.all(bookmarks.map(async (b) => {
            const tags = await TagModel.find({ _id: { $in: b.tags } });
            return { ...b.toObject(), tags: tags };
        }));

        res.json(bookmarksWithTags);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching bookmarks' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { url, title, description, notes, tags, source } = req.body; // tags is array of strings (names)

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ message: 'Invalid URL' });
    }

    let finalTitle = title;
    let finalDesc = description;

    // Auto-fetch logic if title is missing
    if (!finalTitle) {
        try {
            const resp = await fetch(url);
            const html = await resp.text();
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) finalTitle = titleMatch[1];

            // Meta description
            const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
            if (descMatch) finalDesc = descMatch[1];
        } catch (e) {
            console.error("Failed to fetch metadata", e);
        }
    }

    // Handle Tags
    const tagIds: string[] = [];
    if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
            // Find or create
            let tag = await TagModel.findOne({ ownerId: userId, name: tagName });
            if (!tag) {
                tag = await TagModel.create({ ownerId: userId, name: tagName });
            }
            tagIds.push(tag._id.toString());
        }
    }

    try {
        const newBookmark = await BookmarkModel.create({
            ownerId: userId,
            url,
            title: finalTitle || url,
            description: finalDesc,
            notes,
            source,
            tags: tagIds,
            savedFrom: 'web' // default, TODO: logic for 'extension'
        });

        // Populate tags for response
        const tagsObjects = await TagModel.find({ _id: { $in: tagIds } });
        res.status(201).json({ ...newBookmark.toObject(), tags: tagsObjects });
    } catch (e) {
        res.status(500).json({ message: 'Error creating bookmark' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        await BookmarkModel.deleteOne({ _id: req.params.id, ownerId: userId });
        res.json({ message: 'Deleted' });
    } catch (e) {
        res.status(500).json({ message: 'Error deleting' });
    }
});

router.patch('/:id', async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { tags } = req.body;

    // If tags are being updated, we need to convert names to IDs again
    const updateData = { ...req.body };
    if (tags && Array.isArray(tags)) {
        const tagIds: string[] = [];
        for (const tagName of tags) {
            let tag = await TagModel.findOne({ ownerId: userId, name: tagName });
            if (!tag) {
                tag = await TagModel.create({ ownerId: userId, name: tagName });
            }
            tagIds.push(tag._id.toString());
        }
        updateData.tags = tagIds;
    }

    try {
        const updated = await BookmarkModel.findOneAndUpdate(
            { _id: req.params.id, ownerId: userId },
            updateData,
            { new: true }
        );
        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: 'Error updating' });
    }
});

export const bookmarkRouter = router;
