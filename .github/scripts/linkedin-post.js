const axios = require('axios');

// Static post content - update this with your desired message
const POST_CONTENT = `🚀 Ready to accelerate your AI learning journey?

Join the AI Builders Community where we turn curiosity into capability through hands-on collaborative projects!

✨ What makes us different:
• Use case-driven learning (no more tutorial hell!)
• Structured pathway from Explorer to Builder
• Real-world projects with mockups & wireframes
• Safe learning space free of judgment
• Community of like-minded AI enthusiasts

Whether you're a complete beginner or looking to upskill, we meet you where you are and help you reach where you want to go.

🎯 Ready to build your AI future?

#AI #ArtificialIntelligence #AILearning #TechCommunity #SkillDevelopment #AIEducation #ProductFoundry #FutureOfWork #MachineLearning #Innovation`;

async function postToLinkedIn() {
  try {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const personUrn = process.env.LINKEDIN_PERSON_URN;
    
    if (!accessToken || !personUrn) {
      throw new Error('Missing LinkedIn credentials. Please set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN in GitHub secrets.');
    }

    const postData = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: POST_CONTENT
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    console.log('✅ LinkedIn post published successfully!');
    console.log('Post ID:', response.data.id);
    console.log('Posted at:', new Date().toISOString());
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to post to LinkedIn:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please check your LinkedIn access token.');
    } else if (error.response?.status === 403) {
      console.error('Permission denied. Make sure your LinkedIn app has the required permissions.');
    }
    
    throw error;
  }
}

// Run the posting function
postToLinkedIn()
  .then(() => {
    console.log('🎉 Weekly LinkedIn post completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Weekly LinkedIn post failed:', error);
    process.exit(1);
  });