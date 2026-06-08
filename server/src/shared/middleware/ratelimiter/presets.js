//@ts-check
import { rateLimiter } from './limiterFactory.js';
import { RATE_LIMIT_PROFILES } from '../../constants/rateLimits.js';


export const globalLimiter = rateLimiter(RATE_LIMIT_PROFILES.global);
export const apiLimiter = rateLimiter(RATE_LIMIT_PROFILES.api);
export const loginLimiter = rateLimiter(RATE_LIMIT_PROFILES.login);
export const signupLimiter = rateLimiter(RATE_LIMIT_PROFILES.signup);

export const directoryListLimiter = rateLimiter(RATE_LIMIT_PROFILES.directoryList);
export const directoryReadLimiter = rateLimiter(RATE_LIMIT_PROFILES.directoryRead);
export const directoryCompareLimiter = rateLimiter(RATE_LIMIT_PROFILES.directoryCompare);
export const directoryWriteLimiter = rateLimiter(RATE_LIMIT_PROFILES.directoryWrite);
