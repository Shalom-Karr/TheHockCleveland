const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY
});

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
    
    // --- FIX: Ensure the Group ID is parsed as an integer ---
    const groupId = parseInt(process.env.MAILERLITE_GROUP_ID, 10);
    if (isNaN(groupId)) {
        throw new Error('Server configuration error: MailerLite Group ID is not a valid number.');
    }

    const params = {
      email: email,
      fields: {
        name: name || ''
      },
      groups: [groupId], // Use the parsed integer
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
