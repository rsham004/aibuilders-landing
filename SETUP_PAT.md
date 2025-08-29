# GitHub Personal Access Token Setup

## Problem
The GitHub Actions workflow fails because it cannot access the private `AI-Product-Development/wiki` repository using the default `GITHUB_TOKEN`.

## Solution
Create a Personal Access Token (PAT) with repository access and add it as a repository secret.

## Steps

### 1. Create Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set expiration (recommend 90 days or no expiration)
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### 2. Add Repository Secret
1. Go to `rsham004/aibuilders-landing` → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `PAT_TOKEN`
4. Value: [paste your token]
5. Click "Add secret"

### 3. Test the Workflow
Run the manual update workflow to test:
```bash
gh workflow run manual-update.yml --repo rsham004/aibuilders-landing
```

## Alternative Solution
If you can't create a PAT, ask the owner of `AI-Product-Development/wiki` to:
1. Make the repository public, OR
2. Add your GitHub Actions app as a collaborator, OR  
3. Provide you with a PAT that has access

## Verification
Once the PAT is set up, the workflow should successfully:
1. ✅ Clone the private wiki repository
2. ✅ Create discussions from challenge files
3. ✅ Update the landing page data
4. ✅ Deploy to GitHub Pages