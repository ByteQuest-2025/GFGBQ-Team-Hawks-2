import { Request, Response, NextFunction } from 'express';
import { auth } from '../firebase';

declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email?: string;
                name?: string;
                picture?: string;
            }
        }
    }
}

export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify token with Firebase Admin
        const decodedToken = await auth.verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
