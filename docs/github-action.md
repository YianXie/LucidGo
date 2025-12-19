# GitHub Actions Workflows

This document describes the GitHub Actions workflows configured for the LucidGo project. The workflows are located in the `.github/workflows/` directory and automate both continuous integration (CI) and deployment processes.

## Table of Contents

-   [CI Workflow](#ci-workflow)
-   [Deployment Workflow](#deployment-workflow)
-   [Required Secrets](#required-secrets)
-   [Troubleshooting](#troubleshooting)

---

## CI Workflow

**File:** `.github/workflows/ci.yml`

The CI workflow runs automatically on every push and pull request to the `main` branch. It ensures code quality, security, and functionality across both backend and frontend components.

### Triggers

-   **Push events** to `main` branch
-   **Pull request events** targeting `main` branch

### Jobs

The CI workflow consists of four parallel jobs that run independently:

#### 1. Backend Tests (`backend-tests`)

**Purpose:** Validates backend functionality through Django test suite execution.

**Environment:**

-   **Runner:** `ubuntu-latest`
-   **Python Version:** 3.13
-   **Database Service:** PostgreSQL 15 (containerized)

**Steps:**

1. **Checkout code** - Retrieves the repository code
2. **Install Python** - Sets up Python 3.13 environment
3. **Install dependencies** - Installs backend requirements from `requirements.txt`
4. **Run Django tests** - Executes database migrations and test suite

**Database Configuration:**

-   PostgreSQL container runs with health checks
-   Database: `test_db`
-   Password: `postgres`
-   Port: `5432`

**Environment Variables:**

-   `SECRET_KEY`: Test secret key for CI
-   `ENVIRONMENT`: Set to `development`
-   `ALLOWED_HOSTS`: `localhost,127.0.0.1`
-   `API_ENDPOINT`: Retrieved from GitHub secrets
-   `API_TIMEOUT`: 30 seconds

**Test Execution:**

```bash
python manage.py makemigrations && python manage.py migrate
python manage.py test
```

#### 2. Frontend Checks (`frontend-checks`)

**Purpose:** Ensures frontend code quality through linting, formatting checks, and build validation.

**Environment:**

-   **Runner:** `ubuntu-latest`
-   **Node.js Version:** >=22.12
-   **Cache:** npm dependencies cached for faster builds

**Steps:**

1. **Checkout code** - Retrieves the repository code
2. **Set up Node.js** - Configures Node.js with npm caching
3. **Install dependencies** - Runs `npm ci` for clean install
4. **Run ESLint** - Validates JavaScript/JSX code quality
5. **Check Prettier formatting** - Verifies code formatting consistency
6. **Build frontend** - Ensures the project builds successfully

**Files Checked:**

-   `src/**/*.{js,jsx,css,md}` (Prettier)

#### 3. Backend Linting (`backend-linting`)

**Purpose:** Maintains Python code quality and formatting standards.

**Environment:**

-   **Runner:** `ubuntu-latest`
-   **Python Version:** 3.13

**Steps:**

1. **Checkout code** - Retrieves the repository code
2. **Install Python** - Sets up Python 3.13 environment
3. **Install dependencies** - Installs backend requirements
4. **Run Ruff** - Checks code formatting (`ruff format --check .`)
5. **Run isort** - Validates import sorting (`isort --check-only --diff .`)

**Tools Used:**

-   **Ruff:** Fast Python linter and formatter
-   **isort:** Python import sorting tool

#### 4. Security Checks (`security-checks`)

**Purpose:** Identifies security vulnerabilities in both backend and frontend dependencies.

**Environment:**

-   **Runner:** `ubuntu-latest`
-   **Python Version:** 3.13
-   **Node.js Version:** >=22.12

**Backend Security Steps:**

1. **Checkout code** - Retrieves the repository code
2. **Install Python** - Sets up Python 3.13 environment
3. **Install dependencies** - Installs backend requirements
4. **Run Safety CLI** - Scans Python dependencies for known vulnerabilities
5. **Run Bandit** - Performs security linting on Python code

**Frontend Security Steps:**

1. **Set up Node.js** - Configures Node.js environment
2. **Install frontend dependencies** - Runs `npm ci`
3. **Run npm audit** - Scans npm dependencies for vulnerabilities (moderate level and above)

**Security Tools:**

-   **Safety CLI:** Python dependency vulnerability scanner (requires `SAFETY_API_KEY` secret)
-   **Bandit:** Python security linter (excludes `.env`, `__pycache__`, `.venv`)
-   **npm audit:** Node.js dependency vulnerability scanner

---

## Deployment Workflow

**File:** `.github/workflows/deploy.yaml`

The deployment workflow automatically deploys the backend application to AWS EC2 when code is pushed to the `main` branch.

### Triggers

-   **Push events** to `main` branch only

### Permissions

The workflow requires specific permissions for AWS authentication:

-   `id-token: write` - Required for OIDC authentication with AWS
-   `contents: read` - Required to checkout repository code

### Deployment Process

#### Job: `deploy`

**Environment:**

-   **Runner:** `ubuntu-latest`

**Steps:**

1. **Configure AWS Credentials (OIDC)**

    - Uses OpenID Connect (OIDC) for secure, keyless authentication
    - Assumes IAM role specified in `AWS_ARN` secret
    - Configures AWS region from `AWS_REGION` secret
    - **Action:** `aws-actions/configure-aws-credentials@main`

2. **Get Runner IP**

    - Retrieves the GitHub Actions runner's public IP address
    - Used for dynamic security group rule management
    - **Method:** `curl https://checkip.amazonaws.com`

3. **Allow SSH from Runner**

    - Dynamically adds a temporary security group rule
    - Allows SSH (port 22) access from the GitHub Actions runner IP
    - **Security Group:** Specified in `AWS_SECURITY_GROUP_ID` secret
    - **Purpose:** Enables secure deployment without permanent SSH access

4. **Checkout Code**

    - Retrieves the repository code
    - **Action:** `actions/checkout@v3`

5. **Rsync Deployment**

    - Synchronizes backend code to EC2 instance
    - **Action:** `burnett01/rsync-deployments@7.1.0`
    - **Source:** `backend/` directory
    - **Destination:** `/home/ubuntu/lucid-go/app/backend/` on EC2
    - **Options:**
        - `-avz`: Archive mode, verbose, compression
        - `--delete`: Removes files on destination not in source
        - `--exclude`: Excludes `.git`, `env`, `.env`, `staticfiles`
    - **Connection:** Uses SSH with key from `EC2_KEY` secret

6. **Revoke SSH from Runner** (Always runs)
    - Removes the temporary security group rule
    - Executes even if previous steps fail (`if: always()`)
    - **Purpose:** Maintains security by removing temporary access

### Security Features

1. **OIDC Authentication:** No long-lived AWS credentials stored in GitHub
2. **Dynamic Security Groups:** Temporary SSH access only during deployment
3. **Automatic Cleanup:** Security group rules are always revoked, even on failure
4. **Excluded Files:** Sensitive files (`.env`, `env`) are not deployed

### Deployment Flow Diagram

```
Push to main
    ↓
Configure AWS OIDC
    ↓
Get Runner IP
    ↓
Add Security Group Rule (SSH access)
    ↓
Checkout Code
    ↓
Rsync Backend to EC2
    ↓
Revoke Security Group Rule (always)
```

---

## Required Secrets

### CI Workflow Secrets

| Secret Name      | Description                                   | Required For    |
| ---------------- | --------------------------------------------- | --------------- |
| `API_ENDPOINT`   | API endpoint URL for backend tests            | Backend tests   |
| `SAFETY_API_KEY` | Safety CLI API key for vulnerability scanning | Security checks |

### Deployment Workflow Secrets

| Secret Name             | Description                                        | Required For                 |
| ----------------------- | -------------------------------------------------- | ---------------------------- |
| `AWS_ARN`               | IAM role ARN for OIDC authentication               | AWS credential configuration |
| `AWS_REGION`            | AWS region where resources are located             | AWS credential configuration |
| `AWS_SECURITY_GROUP_ID` | EC2 security group ID for SSH access               | Security group management    |
| `EC2_HOST`              | EC2 instance hostname or IP address                | Rsync deployment             |
| `EC2_USER`              | SSH username for EC2 instance (typically `ubuntu`) | Rsync deployment             |
| `EC2_KEY`               | Private SSH key for EC2 access                     | Rsync deployment             |

### Setting Up Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

### AWS OIDC Setup

To use OIDC authentication, you need to configure an IAM role with a trust relationship that allows GitHub Actions to assume it. The trust policy should include:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                },
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:*"
                }
            }
        }
    ]
}
```

---

## Troubleshooting

### CI Workflow Issues

#### Backend Tests Failing

-   **Database connection errors:** Verify PostgreSQL service is healthy (check health check configuration)
-   **Test failures:** Review test output for specific test failures
-   **Migration errors:** Ensure `makemigrations` runs successfully before `migrate`

#### Frontend Checks Failing

-   **ESLint errors:** Fix linting issues in JavaScript/JSX files
-   **Prettier errors:** Run `npx prettier --write` to auto-fix formatting
-   **Build failures:** Check for compilation errors in the frontend code

#### Linting Failures

-   **Ruff errors:** Run `ruff format .` to auto-fix formatting issues
-   **isort errors:** Run `isort .` to auto-fix import sorting

#### Security Check Failures

-   **Safety CLI:** Update vulnerable packages to secure versions
-   **Bandit:** Review and fix security issues in Python code
-   **npm audit:** Run `npm audit fix` to resolve vulnerabilities (review changes before committing)

### Deployment Workflow Issues

#### AWS Authentication Failures

-   **OIDC errors:** Verify IAM role trust relationship is correctly configured
-   **Region errors:** Ensure `AWS_REGION` secret matches your AWS resources location
-   **Permission errors:** Check IAM role has necessary permissions for EC2 and security group operations

#### Security Group Issues

-   **SSH access denied:** Verify security group rule is being added correctly
-   **IP not whitelisted:** Check runner IP is correctly retrieved and added
-   **Rule not revoked:** Verify cleanup step runs (should always execute)

#### Rsync Deployment Failures

-   **Connection errors:** Verify EC2 instance is running and accessible
-   **SSH key errors:** Ensure `EC2_KEY` secret contains the correct private key
-   **Permission errors:** Check SSH user has write permissions to destination directory
-   **Path errors:** Verify `EC2_HOST`, `EC2_USER`, and remote path are correct

#### Post-Deployment Issues

-   **Application not running:** SSH into EC2 and check application status
-   **Missing dependencies:** Ensure all required packages are installed on EC2
-   **Environment variables:** Verify `.env` file is properly configured on EC2 (not deployed via rsync)

### Common Solutions

1. **Check workflow logs:** Review the Actions tab in GitHub for detailed error messages
2. **Verify secrets:** Ensure all required secrets are set and have correct values
3. **Test locally:** Run CI checks locally before pushing to catch issues early
4. **Review permissions:** Verify IAM role has all necessary AWS permissions
5. **Check EC2 status:** Ensure EC2 instance is running and accessible

---

## Best Practices

1. **Never commit secrets:** Always use GitHub Secrets for sensitive information
2. **Review security findings:** Address security vulnerabilities promptly
3. **Test before merging:** Ensure all CI checks pass before merging PRs
4. **Monitor deployments:** Check deployment logs and verify application after deployment
5. **Keep dependencies updated:** Regularly update Python and Node.js dependencies
6. **Use OIDC:** Prefer OIDC over static credentials for AWS authentication
7. **Clean up resources:** Ensure temporary resources (like security group rules) are always cleaned up

---

## Additional Resources

-   [GitHub Actions Documentation](https://docs.github.com/en/actions)
-   [AWS OIDC for GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
-   [Django Testing](https://docs.djangoproject.com/en/stable/topics/testing/)
-   [Ruff Documentation](https://docs.astral.sh/ruff/)
-   [Safety CLI](https://pyup.io/safety/)
