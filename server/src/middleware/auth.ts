import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwtSecret } from '../utils/jwtUtils';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        // Memanggil jwt.verify dan memberikan fungsi callback dengan tipe yang benar
        jwt.verify(token, jwtSecret, (err: jwt.VerifyErrors | null, user: JwtPayload | string | undefined) => {
            if (err) {
                return res.status(403).json({ error: "Forbidden. Invalid token." });
            }

            // Pastikan user bukan undefined dan memiliki userId
            if (user && typeof user !== 'string' && 'userId' in user) {
                (req as any).user = { id: (user as JwtPayload).userId }; // Menyimpan userId ke req.user
                console.log("Authenticated user:", user); // Log untuk debugging
                next();
            } else {
                return res.status(401).json({ error: "Unauthorized. User ID is missing." });
            }
        });
    } else {
        res.status(401).json({ error: "Unauthorized. Token is missing." });
    }
};
