import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { z } from 'zod';

const router = Router();

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// Helper to sign JWT
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });
};

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password } = signupSchema.parse(req.body);

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({
            email,
            password: hashedPassword,
        });

        const token = generateToken(newUser._id.toString());

        // Set cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Needed for extension? Maybe 'none' if extension is different origin? 
            // For extension to work, we might need to send token in body too or allow CORS with credentials.
            // Extension usually runs in 'chrome-extension://' origin.
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({ token, user: { id: newUser._id, email: newUser.email } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id.toString());

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ token, user: { id: user._id, email: user.email } });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/me', async (req: Request, res: Response) => {
    // Middleware should handle this, but implemented simply here for checking
    // We need middleware to extract user from token
    // For now verify logic:
    try {
        const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        const user = await UserModel.findById(decoded.userId).select('-password');
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        return res.json({ user });
    } catch (e) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out' });
});

export const authRouter = router;
