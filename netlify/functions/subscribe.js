const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

// Initialize the MailerLite SDK with the API key from environment variables
const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY
});

// --- HARDCODED GROUP ID ---
// The confirmed Group ID for the "Shalom Karr Website Form" group.
const GROUP_ID = 169569218509931738;

exports.handler = async (event) => {
  // Only allow POST requests for this function
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, name } = JSON.parse(event.body);

    // Server-side validation for the email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'A valid email is required.' })
      };
    }
    
    // Prepare the subscriber data for the MailerLite API
    const params = {
      email: email,
      fields: {
        name: name || '' // Use the provided name, or an empty string if none
      },
      groups: [GROUP_ID], // Use the hardcoded Group ID
      status: 'active', // Immediately subscribe the user
    };

    // Call the MailerLite API to add or update the subscriber
    const response = await mailerlite.subscribers.createOrUpdate(params);

    // Check for a successful response from the API
    if (response.data && response.data.id) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success! You have been subscribed.' })
        };
    } else {
        // This case handles unexpected successful responses that don't look right
        throw new Error('Subscriber creation failed for an unknown reason.');
    }

  } catch (error) {
    // Log the detailed error for debugging in Netlify
    console.error('API Error:', error.response ? error.response.data : error.message);
    
    // Send a user-friendly error message back to the front-end
    const errorMessage = error.response?.data?.error?.message || 'An error occurred. Please try again later.';
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ message: errorMessage })
    };
  }
};
