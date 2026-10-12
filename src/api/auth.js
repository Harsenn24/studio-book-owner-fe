import { send } from './http'

// Envelopes are returned as-is: "Verification email re-sent" / "Email has been limited" are flows, not errors
export const authApi = {
  login: (email, password) => send('post', 'owner/auth/login', { email, password }),
  register: (name, email, password) => send('post', 'owner/auth/register', { name, email, password }),
  verifyEmail: (tokenVerify) => send('post', 'owner/auth/verify-email', { token_verify: tokenVerify }),
}
