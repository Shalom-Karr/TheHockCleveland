// Use the MailerLite SDK for simplicity and reliability
const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY
});

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, name } = JSON.parse(event.body);

    // --- Basic Server-Side Validation ---
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'A valid email is required.' })
      };
    }

    const params = {
      email: email,
      fields: {
        name: name || '' // Name is optional but good to have
      },
      groups: [process.env.MAILERLITE_GROUP_ID],
      status: 'active', // or 'unconfirmed' if you have double opt-in enabled
    };

    const response = await mailerlite.subscribers.createOrUpdate(params);

    console.log('MailerLite API Response:', response);

    // MailerLite API returns data in a 'data' object on success
    if (response.data && response.data.id) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success! You have been subscribed.' })
        };
    } else {
        // Handle cases where the API might not return an error but wasn't successful
        throw new Error('Subscriber creation failed for an unknown reason.');
    }

  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
    
    // Extract a user-friendly error message if available
    const errorMessage = error.response?.data?.error?.message || 'An error occurred. Please try again later.';
    
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ message: errorMessage })
    };
  }
};
