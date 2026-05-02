import argon2 from 'argon2';

// argon2id with OWASP-recommended parameters.
const options = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export const hashPassword = (plain) => argon2.hash(plain, options);

export const verifyPassword = async (hash, plain) => {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
};
