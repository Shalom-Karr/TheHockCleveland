const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY
});

const GROUP_ID = "169569218509931738";

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, name } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'A valid email is required.' })
      };
    }
    
    const params = {
      email: email,
      fields: {
        name: name || ''
      },
      groups: [GROUP_ID],
      status: 'active',
    };

    const response = await mailerlite.subscribers.createOrUpdate(params);
    
    // --- THE FINAL FIX ---
    // The SDK response has a nested structure. The actual subscriber data is in `response.data.data`.
    if (response && response.data && response.data.data && response.data.data.id) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success! You have been subscribed.' })
        };
    } else {
        // We can now remove the diagnostic log as we have solved the issue.
        console.error('Unexpected API Response Structure:', response);
        throw new Error('Subscriber creation failed due to an unexpected API response format.');
    }

  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.error?.message || 'An error occurred. Please try again later.';
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ message: errorMessage })
    };
  }
};
