import { JWT } from "../security/JWT.js";

const jwtService = new JWT();

export default async function authMiddleware(req, res, next) {
  try {
        const authHeader = req.headers['authorization'];
        const tokenFromBody = req.body.access_token;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7)
        } else if (tokenFromBody) {
            token = tokenFromBody;
        }

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const verification = await jwtService.verifyToken({ token }).run();
        if (verification.isLeft()) {
            return res.status(401).json({ error: verification.value });
        }
        const decoded = verification.value;
        req.user = { id: decoded.id, username: decoded.username };

        next();
    } catch (err) {
        return res.status(401).json({error: 'Invalid Request'});
    }
}
