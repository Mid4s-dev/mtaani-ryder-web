# Security Guidelines for Ryder Mtaani

## Environment Variables & Secrets

### ⚠️ Important Security Notice

**NEVER commit sensitive credentials to version control!**

### Files That Should NEVER Contain Real Secrets:
- `deploy-heroku.sh` - Uses placeholders and prompts for real passwords
- `.env.heroku` - Template file with placeholder values
- `HEROKU_DEPLOYMENT.md` - Documentation with example values
- Any documentation files

### Sensitive Information Includes:
- Database passwords
- API keys (Google Maps, SendGrid, etc.)
- JWT secrets
- Production URLs with authentication

### Safe Practices:

#### 1. Environment Files
```bash
# ✅ CORRECT: Use .env for local development (not tracked)
DB_PASSWORD=real_password_here

# ✅ CORRECT: Use .env.example for templates (tracked)
DB_PASSWORD=your_password_here

# ❌ WRONG: Never put real secrets in tracked files
```

#### 2. Deployment Scripts
```bash
# ✅ CORRECT: Prompt for sensitive data
read -s -p "Enter database password: " DB_PASSWORD

# ✅ CORRECT: Read from untracked .env file
DB_PASSWORD=$(grep "DB_PASSWORD=" .env | cut -d '=' -f2)

# ❌ WRONG: Hardcode real passwords in scripts
```

#### 3. Documentation
```markdown
<!-- ✅ CORRECT: Use placeholders -->
DB_PASSWORD=your_actual_password_here

<!-- ❌ WRONG: Real passwords in docs -->
# ❌ WRONG: Real passwords in docs
DB_PASSWORD=real_password_exposed_here
```

## Deployment Security

### Heroku Configuration
When deploying to Heroku, sensitive variables are set securely:

```bash
# The deploy script will prompt for real values
./deploy-heroku.sh

# Or set them manually
heroku config:set DB_PASSWORD=your_real_password -a your-app
```

### Production Environment
- All sensitive data stored as Heroku config vars
- HTTPS enforced with secure cookies
- CSRF protection enabled
- Database connections encrypted

## If Secrets Are Accidentally Committed

### Immediate Actions:
1. **Remove secrets** from all tracked files
2. **Create new commit** with sanitized files  
3. **Force push** to overwrite history (if safe)
4. **Rotate credentials** - change passwords/keys
5. **Update deployment** with new credentials

### Recovery Commands:
```bash
# 1. Fix files and commit changes
git add .
git commit -m "🔒 Remove exposed credentials - use placeholders"

# 2. Force push to overwrite sensitive commit
git push --force-with-lease origin main

# 3. Update deployment with new credentials
heroku config:set DB_PASSWORD=new_password -a your-app
```

## Contact Security Issues

If you discover a security vulnerability, please:
1. **Do not** create a public issue
2. Email the maintainer directly
3. Include detailed information about the vulnerability
4. Wait for confirmation before disclosing

---

**Remember: Security is everyone's responsibility!** 🔒