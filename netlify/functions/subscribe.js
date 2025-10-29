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
    
    // --- CORRECTED DIAGNOSTIC LOG ---
    // Log only the 'data' part of the response to avoid circular structure errors.
    console.log('MailerLite Success Response DATA:', JSON.stringify(response.data, null, 2));

    // Check for a successful response from the API
    if (response && response.data && response.data.id) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success! You have been subscribed.' })
        };
    } else {
        throw new Error('Subscriber creation failed because the API response was not in the expected format.');
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
