export function honeypotCheck(req, res, next) {
  const { website } = req.body // same field name as frontend

  if (website) {
    // Silently accept — don't reveal to bot it was caught
    return res.status(200).json({ message: 'OK' })
  }

  next()
}