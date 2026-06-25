/**
 * User-Agent sanity check middleware to block known bot patterns except legitimate browsers.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export function uaSanity(req, res, next) {
  const ua = req.headers['user-agent']

  // No UA at all — definitely a script
  if (!ua) {
    return res.status(400).json({ message: 'Invalid request' })
  }

  // Known bad bot UAs
  const blockedPatterns = [/curl/i, /python/i, /scrapy/i, /wget/i, /bot/i]
  const isBot = blockedPatterns.some((p) => p.test(ua))

  if (isBot) {
    return res.status(400).json({ message: 'Invalid request' })
  }

  next()
}