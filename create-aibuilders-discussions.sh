#!/bin/bash

# Configuration
SOURCE_REPO="AI-Product-Development/wiki"
TARGET_REPO="AI-Product-Development/aibuilders"
CHALLENGES_DIR="challenges"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Creating AI Builders Challenge Discussions${NC}"
echo -e "${BLUE}Source: ${SOURCE_REPO}/${CHALLENGES_DIR}${NC}"
echo -e "${BLUE}Target: ${TARGET_REPO}/discussions${NC}"
echo

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first.${NC}"
    echo "Install: brew install gh  OR  winget install --id GitHub.cli"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Please authenticate with GitHub CLI: gh auth login${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Getting discussion categories for ${TARGET_REPO}...${NC}"

# Get the category ID for "Challenges or Collaborations"
CATEGORY_JSON=$(gh api "/repos/$TARGET_REPO/discussions/categories" 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to get discussion categories. Please check repository access.${NC}"
    exit 1
fi

# Extract category ID for challenges
CATEGORY_ID=$(echo "$CATEGORY_JSON" | jq -r '.[] | select(.name | test("(?i)challenge|collaboration")) | .id' | head -1)

if [ -z "$CATEGORY_ID" ]; then
    echo -e "${YELLOW}Available categories:${NC}"
    echo "$CATEGORY_JSON" | jq -r '.[] | "  \(.id) - \(.name)"'
    echo
    read -p "Enter the category ID for challenges: " CATEGORY_ID
    if [ -z "$CATEGORY_ID" ]; then
        echo -e "${RED}❌ Category ID required${NC}"
        exit 1
    fi
else
    CATEGORY_NAME=$(echo "$CATEGORY_JSON" | jq -r ".[] | select(.id == \"$CATEGORY_ID\") | .name")
    echo -e "${GREEN}✅ Found category: ${CATEGORY_NAME} (${CATEGORY_ID})${NC}"
fi

echo

# Check if challenges directory exists locally
if [ ! -d "$CHALLENGES_DIR" ]; then
    echo -e "${YELLOW}📂 Challenges directory not found locally. Cloning wiki repo...${NC}"
    if [ ! -d "temp_wiki" ]; then
        gh repo clone "$SOURCE_REPO" temp_wiki
        CHALLENGES_DIR="temp_wiki/challenges"
    fi
fi

if [ ! -d "$CHALLENGES_DIR" ]; then
    echo -e "${RED}❌ Cannot find challenges directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Processing markdown files in ${CHALLENGES_DIR}...${NC}"
echo

# Initialize counters
SUCCESS_COUNT=0
FAIL_COUNT=0
CREATED_DISCUSSIONS=()

# Process each markdown file
find "$CHALLENGES_DIR" -name "*.md" -type f | sort | while read -r file; do
    echo -e "${BLUE}📄 Processing: $(basename "$file")${NC}"
    
    # Extract title from first heading or use filename
    title=$(head -20 "$file" | grep -m1 "^# " | sed 's/^# //' | tr -d '\r\n')
    
    # If no title found in file, use filename
    if [ -z "$title" ]; then
        title=$(basename "$file" .md | sed 's/[-_]/ /g' | sed 's/\b\(.\)/\u\1/g')
    fi
    
    # Add challenge prefix if not already present
    if [[ ! "$title" =~ ^(Challenge|🎯) ]]; then
        title="🎯 Challenge: $title"
    fi
    
    echo -e "   📝 Title: ${title}"
    
    # Read file content and add source attribution
    content=$(cat "$file")
    
    # Add header with source info and community context
    discussion_body="# 🎯 AI Builder Challenge

$content

---

## 🤝 How to Participate

1. **💬 Comment below** with your approach or questions
2. **🔗 Share your progress** - link to your repo, demo, or writeup  
3. **🏷️ Tag others** who might be interested in collaborating
4. **⭐ Star this discussion** to follow updates

## 📚 Resources

- 📖 **Source Wiki**: [AI-Product-Development/wiki/challenges](https://github.com/AI-Product-Development/wiki/tree/main/challenges)
- 🏠 **Community Home**: [AI Builders](https://github.com/AI-Product-Development/aibuilders)
- 💡 **More Challenges**: Browse other discussions in this category

---
*This challenge was imported from our community wiki. Feel free to suggest improvements or variations!*"
    
    # Create discussion using GitHub CLI
    echo -e "   🔄 Creating discussion..."
    
    result=$(gh api \
        --method POST \
        --header "Accept: application/vnd.github.v3+json" \
        "/repos/$TARGET_REPO/discussions" \
        --field "title=$title" \
        --field "body=$discussion_body" \
        --field "category_id=$CATEGORY_ID" 2>&1)
    
    if echo "$result" | grep -q "html_url"; then
        url=$(echo "$result" | jq -r '.html_url' 2>/dev/null)
        echo -e "   ${GREEN}✅ Created: $url${NC}"
        echo "$url" >> created_discussions.txt
        ((SUCCESS_COUNT++))
        
        # Add brief delay to respect rate limits
        sleep 2
    else
        echo -e "   ${RED}❌ Failed to create discussion${NC}"
        echo "   Error: $result"
        ((FAIL_COUNT++))
    fi
    
    echo
done

# Read final counts from the file (since subshell variables don't persist)
if [ -f "created_discussions.txt" ]; then
    SUCCESS_COUNT=$(wc -l < created_discussions.txt)
    echo -e "${GREEN}🎉 Summary:${NC}"
    echo -e "   ✅ Successfully created: ${SUCCESS_COUNT} discussions"
    echo -e "   📋 Created discussions saved to: created_discussions.txt"
    echo
    echo -e "${BLUE}🔗 Created Discussions:${NC}"
    cat created_discussions.txt | while read url; do
        echo -e "   • $url"
    done
else
    echo -e "${YELLOW}⚠️  No discussions were created${NC}"
fi

# Cleanup temporary wiki clone if we created it
if [ -d "temp_wiki" ]; then
    echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
    rm -rf temp_wiki
fi

echo
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo -e "   1. Visit your discussions: https://github.com/${TARGET_REPO}/discussions"
echo -e "   2. Pin important challenges"
echo -e "   3. Engage with the community!"
echo -e "${GREEN}✨ Happy building!${NC}"