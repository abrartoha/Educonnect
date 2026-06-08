// Duration helpers. All numeric helpers return seconds.

export const seconds = (n) => n;
export const minutes = (n) => n * 60;
export const hours = (n) => n * 3600;
export const days = (n) => n * 86400;

export const toMs = (secs) => secs * 1000;
export const toSecs = (ms) => Math.round(ms / 1000);

/**
 * Parse a human-readable duration string into seconds.
 * Supported units: s (seconds), m (minutes), h (hours), d (days).
 * @param {string} str - e.g. "60s", "15m", "1h", "2d"
 * @returns {number} duration in seconds
 */
export const parseDuration = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError(`parseDuration expected a string, got ${typeof str}`);
  }

  const match = str.trim().match(/^(\d+(?:\.\d+)?)\s*(s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration format: "${str}". Use "<number><s|m|h|d>" (e.g. "15m", "1h").`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return seconds(value);
    case 'm': return minutes(value);
    case 'h': return hours(value);
    case 'd': return days(value);
    default: throw new Error(`Unknown unit: "${unit}"`);
  }
};
