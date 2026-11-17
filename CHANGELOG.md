# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-11-17

### Added
- v2.0.0 release with focus on stability and accessibility
- 44 automated tests covering backend and frontend
- Enhanced ARIA labels and keyboard navigation for accessibility
- Theme customization in user profile
- Improved error handling with graceful degradation
- Real-time updates via Socket.IO with authentication

### Fixed
- 30 issues closed - all reported bugs and improvements implemented
- Security: JWT tokens now stored in httpOnly cookies
- Access control: role cannot be overridden by client
- Server-side validation for all permission checks
- Robust map display with graceful fallback for unknown addresses
- XSS protection and input validation

### Security
- JWT authentication with httpOnly cookies
- Server-side authorization checks
- Role-based access control (organizer, admin)
- Socket.IO authentication required
- Secure password handling with bcrypt

### Infrastructure
- GitHub Actions CI/CD pipeline
- Automated test execution on PR and push
- Deployment to Render
- Database: MongoDB with Mongoose

## [1.0.0] - 2026-10-01

### Added
- Initial release
- Event creation, search, and registration
- User authentication with Google OAuth
- Real-time updates with Socket.IO
- Mobile-responsive design
- Event details with maps integration
