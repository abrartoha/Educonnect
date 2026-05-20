import validator from 'validator'
import disposableDomains from 'disposable-email-domains'
import dns from 'dns/promises'

export async function emailValidator(req, res, next) {
    const { email } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format' })
    }

    const domain = normalizedEmail.split('@')[1]

    if (disposableDomains.includes(domain)) {
        return res.status(400).json({ message: 'Disposable emails not allowed' })
    }

    try {
        const records = await dns.resolveMx(domain)

        if (!records || records.length === 0) {
            return res.status(400).json({ message: 'Email domain cannot receive emails' })
        }
    } catch {
        return res.status(400).json({ message: 'Email domain does not exist' })
    }

    req.normalizedEmail = normalizedEmail
    next()
}