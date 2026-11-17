# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Møteplass, please email **security@example.com** with:

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if any)

**Please do not** create a public GitHub issue for security vulnerabilities.

We will acknowledge your email within 48 hours and provide a timeline for fixing the issue.

## Security Practices

This project follows these security best practices:

### Authentication & Authorization
- JWT tokens stored in httpOnly cookies (not accessible by JavaScript)
- Tokens never sent in URLs
- Server-side authorization checks on all protected endpoints
- Role-based access control (organizer, admin)
- Roles set only on server, never trusted from client

### Data Protection
- Password hashing with bcrypt
- HTTPS in production
- Input validation and sanitization
- Protection against XSS attacks
- SQL injection prevention via Mongoose

### API Security
- CORS properly configured
- Rate limiting recommended for production
- API endpoints require authentication where appropriate

### Dependencies
- Regular security audits with `npm audit`
- Prompt updates of vulnerable packages
- Review of dependency licenses

## Supported Versions

| Version | Status | Support Until |
|---------|--------|----------------|
| 2.0.x   | Current | 2027-11-17 |
| 1.0.x   | Deprecated | 2026-12-31 |

## Security Headers

Production deployment includes:
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`

## Third-Party Security

- Google OAuth for authentication
- Render for hosting
- MongoDB for database
- All external services use HTTPS

## Questions?

For general security questions, please contact the maintainers privately.
