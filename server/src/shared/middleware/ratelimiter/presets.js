//@ts-check
import { rateLimiter } from "./limiterFactory.js";

export const globalLimiter = rateLimiter({
    window: 60, // 1 minute
    limit: 100,
});



export const apiLimiter = rateLimiter({
    window: 60, // 1 minute
    limit: 5,
    blockDuration: 15 * 60, // Block for 15 minutes after exceeding limit (in seconds)
});


export const loginLimiter = rateLimiter({
    window: 15 * 60, // 15 minutes (in seconds)
    limit: 5,
    scope: "email",
    blockDuration: 30 * 60, // Block for 30 minutes after exceeding limit (in seconds)
    routeSpecificLimit: true,
});

export const signupLimiter = rateLimiter({
    window: 60 * 60, // 1 hour (in seconds)
    limit: 5,
    scope: "email",
    routeSpecificLimit: true,
    blockDuration: 60 * 60, // Block for 1 hour after exceeding limit (in seconds)
});

// Please assign scope if the rateLimiter is used for protected routes.