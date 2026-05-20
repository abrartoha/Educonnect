import crypto from 'crypto';

/**
 * Generates a unique fingerprint for the requester based on the specified scope
 * @param {Request} req - Express request object
 * @param {string} scope - "ip" | "user" | "email" to determine rate limit key structure
 * @returns {{fingerPrint: string, identifier: string}} - Object containing the fingerprint and identifier
 */

export function createFingerprint(req, scope) {
    
    const ua = req.headers['user-agent'] || '';

    if (scope === "ip") {
        const ip = req.ip || req.socket.remoteAddress || '';
        const raw = `${ip}:${ua}`;
        return {
            fingerPrint: crypto.createHash('sha1').update(raw).digest('hex'),
            identifier: ip,
        };
    }
    else if (scope === "user") {
        const id = req.user?.id || 'unknown';
        const raw = `${id}:${ua}`;
        return {
            fingerPrint: crypto.createHash('sha1').update(raw).digest('hex'),
            identifier: id,
        };
    }
    else if (scope === "email") {
        const email = req.body.email || 'unknown';
        const raw = `${email}:${ua}`;
        return {
            fingerPrint: crypto.createHash('sha1').update(raw).digest('hex'),
            identifier: email,
        };
    }
    return {
        fingerPrint: 'unknown',
        identifier: 'unknown'
    };
}