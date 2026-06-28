import validator from 'validator'
import disposableDomains from 'disposable-email-domains' with { type: 'json' }
import dns from 'dns/promises'

/**
 * Validates email format, checks for disposable domains, and verifies MX records
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export async function emailValidator(req, res, next) {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format' })
    }

    const domain = normalizedEmail.split('@')[1];
    const disposable = disposableDomains.includes(domain);

    if (disposable) {
        return res.status(400).json({ message: 'Disposable emails not allowed' })
    }
    
    try {
        const records = await dns.resolveMx(domain);

        if (!records || records.length === 0) {
            return res.status(400).json({ message: 'Email domain cannot receive emails' })
        }
    } catch {
        return res.status(400).json({ message: 'Email domain does not exist' })
    }

    req.normalizedEmail = normalizedEmail
    next()
}

// https://nodejs.org/api/dns.html#dnsresolvemxhostname-callback