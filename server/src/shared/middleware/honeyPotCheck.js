/**
 * Honeypot check middleware to detect bot submission fields.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export function honeypotCheck(req, res, next) {
  const { website } = req.body // same field name as frontend

  if (website) {
    // Silently accept — don't reveal to bot it was caught
    return res.status(200).json({ message: 'OK' })
  }

  next()
}