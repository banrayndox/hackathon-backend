import axios from 'axios';
import querystring from 'querystring';

// Exchange authorization code for access token
export const getGoogleTokens = async (code) => {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const data = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  };

  const response = await axios.post(tokenUrl, querystring.stringify(data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

// Fetch user info from Google using access token
export const getGoogleUserInfo = async (accessToken) => {
  const response = await axios.get(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};