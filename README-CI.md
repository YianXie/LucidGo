# CI/CD Setup

This project includes a comprehensive CI/CD setup with automated code formatting, linting, testing, and security checks.

## Quick Start

### Local Development

1. **Install development dependencies:**
   ```bash
   make install-dev
   ```

2. **Run all checks:**
   ```bash
   make all-checks
   ```

3. **Format code:**
   ```bash
   make format
   ```

4. **Run specific checks:**
   ```bash
   make lint          # Lint all code
   make test          # Run all tests
   make security      # Run security checks
   ```

### Available Make Commands

- `make help` - Show all available commands
- `make install` - Install production dependencies
- `make install-dev` - Install development dependencies
- `make format` - Format all code (Python + Frontend)
- `make format-check` - Check if code is formatted correctly
- `make lint` - Lint all code (Python + Frontend)
- `make test` - Run all tests
- `make security` - Run security checks
- `make clean` - Clean up temporary files
- `make all-checks` - Run all checks (format, lint, test, security)

## Tools Used

### Python Backend
- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Type checking
- **bandit**: Security analysis
- **safety**: Vulnerability scanning
- **pytest**: Testing framework

### Frontend
- **Prettier**: Code formatting
- **ESLint**: Linting
- **npm audit**: Security audit

### Pre-commit Hooks
- Automated checks before commits
- Runs formatting, linting, and security checks
- Install with: `pre-commit install`

## GitHub Actions

The CI pipeline runs on every push and pull request to main/develop branches:

1. **Code Formatting Check** - Ensures code follows formatting standards
2. **Linting** - Checks for code quality issues
3. **Security Checks** - Scans for vulnerabilities
4. **Testing** - Runs all tests
5. **Pre-commit Hooks** - Runs additional checks

## Configuration Files

- `Makefile` - Main automation file
- `backend/requirements-dev.txt` - Python development dependencies
- `backend/.flake8` - Flake8 configuration
- `backend/mypy.ini` - MyPy type checking configuration
- `backend/pyproject.toml` - Black, isort, bandit, and coverage configuration
- `frontend/.prettierrc` - Prettier configuration
- `.pre-commit-config.yaml` - Pre-commit hooks configuration
- `.github/workflows/ci.yml` - GitHub Actions CI workflow

## Security Reports

Security reports are generated and uploaded as artifacts:
- `bandit-report.json` - Python security analysis
- `safety-report.json` - Python vulnerability scan

## Troubleshooting

### Common Issues

1. **Formatting errors**: Run `make format` to auto-fix
2. **Linting errors**: Check the specific error messages and fix accordingly
3. **Security issues**: Review the security reports and update dependencies
4. **Test failures**: Check the test output for specific failure reasons

### Pre-commit Issues

If pre-commit hooks fail:
```bash
pre-commit run --all-files
```

### Clean Up

To clean up temporary files:
```bash
make clean
```