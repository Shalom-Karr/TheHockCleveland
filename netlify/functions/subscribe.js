const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY
});

// The Group ID must be a STRING, as confirmed by the API response.
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
      // --- FINAL FIX: Send the Group ID as a string ---
      groups: [GROUP_ID], 
      status: 'active',
    };

    const response = await mailerlite.subscribers.createOrUpdate(params);

    if (response.data && response.data.id) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success! You have been subscribed.' })
        };
    } else {
        throw new Error('Subscriber creation failed for an unknown reason.');
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
