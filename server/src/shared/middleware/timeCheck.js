export function timeCheck(req, res, next) {
  const { submittedAt } = req.body // timestamp sent from frontend

  if (!submittedAt) return res.status(400).json({ message: 'Invalid request' })

  const timeSpent = Date.now() - submittedAt

  if (timeSpent < 3000) {
    // Filled too fast — bot
    return res.status(200).json({ message: 'OK' }) // silent reject
  }

  if (timeSpent > 30 * 60 * 1000) {
    // Form token too old (30 mins) — replay attack
    // Session revoking logic would go here if we had sessions
    return res.status(400).json({ message: 'Session expired, please refresh' });
  }

  next()
}