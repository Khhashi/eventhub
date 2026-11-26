# Contributing to Møteplass

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/eventhub.git
   cd eventhub
   ```
3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Khhashi/eventhub.git
   ```

## Setup Development Environment

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Create `server/.env` using `server/.env.example` as template.

```bash
npm run dev
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Follow the existing code style
   - Add tests for new functionality

3. **Test locally**
   ```bash
   npm test
   npm run format
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Link to related issues
   - Describe what you changed and why
   - Ensure tests pass locally (`npm test`)

## Code Style

- Use Prettier for formatting: `npm run format`
- Follow ESLint rules
- Write meaningful variable and function names
- Comment complex logic, not obvious code

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add event filtering by category
fix: Resolve map display error on unknown address
docs: Update setup instructions
test: Add tests for authentication
```

## Testing

- **Backend tests**: `npm test --prefix server`
- **Frontend tests**: `npm test --prefix client`
- **Coverage**: `npm test -- --coverage`

Ensure all tests pass before submitting a PR.

## Issues and Bug Reports

- Check existing issues before creating new ones
- Provide clear descriptions and reproduction steps
- Include environment details (OS, Node version, etc.)

## Pull Request Process

1. Update README.md if needed
2. Add tests for new features
3. Ensure tests pass locally
4. Request review from maintainers
5. Respond to feedback promptly

## Questions?

Feel free to ask questions in issues or discussions.

---

**Thank you for contributing to Møteplass!** 🎉
