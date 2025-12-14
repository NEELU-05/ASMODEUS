# 🚀 Push to GitHub - Step by Step

## Quick Commands to Run

Open a terminal in the ASMODEUS folder and run these commands one by one:

### 1. Initialize Git Repository
```bash
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Create Initial Commit
```bash
git commit -m "Initial commit - ASMODEUS Amadeus CRS Training Simulator"
```

### 4. Rename Branch to Main
```bash
git branch -M main
```

### 5. Add Remote Repository
```bash
git remote add origin https://github.com/NEELU-05/ASMODEUS.git
```

### 6. Push to GitHub
```bash
git push -u origin main
```

---

## If You Get Authentication Error

You may need to authenticate with GitHub. Use one of these methods:

### Option 1: GitHub CLI (Recommended)
```bash
gh auth login
```

### Option 2: Personal Access Token
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Select scopes: `repo`
4. Copy the token
5. When pushing, use token as password

### Option 3: SSH Key
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub
# Copy the public key and add it to GitHub Settings → SSH Keys
cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:NEELU-05/ASMODEUS.git
git push -u origin main
```

---

## After Successful Push

Your code will be at:
```
https://github.com/NEELU-05/ASMODEUS
```

Next steps:
1. ✅ Code is on GitHub
2. 🚀 Deploy to Render.com (see RENDER_DEPLOY.md)
3. 🌐 Share your live URL
4. 🎓 Start training!

---

## Troubleshooting

### "Repository not found"
- Make sure the repository exists on GitHub
- Check you have write access
- Verify the URL is correct

### "Authentication failed"
- Use GitHub CLI: `gh auth login`
- Or use Personal Access Token
- Or set up SSH key

### "Already exists"
If you get "already initialized", skip `git init` and continue from step 2.

---

## All Commands in One Block

Copy and paste this entire block:

```bash
git init
git add .
git commit -m "Initial commit - ASMODEUS Amadeus CRS Training Simulator"
git branch -M main
git remote add origin https://github.com/NEELU-05/ASMODEUS.git
git push -u origin main
```

---

**Good luck! Your ASMODEUS simulator is ready to go live!** 🎉
