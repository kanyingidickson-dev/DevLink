Password reset flow:

1. User submits email to /api/password-reset/request
   - If user exists, creates a VerificationToken (identifier=email, token, expires).
   - Email with reset link (TODO: implement email send).

2. User visits reset link, submits new password and token to /api/password-reset/confirm
   - If token valid and not expired, updates user password.
   - Token is deleted (single use).

Security:
- Tokens expire after 30 minutes.
- Password must be at least 8 characters.
- No info leak on unknown email.
