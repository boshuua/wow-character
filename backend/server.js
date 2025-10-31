import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors'; // Import cors middleware
import { Buffer } from 'buffer'; // Import Buffer

// Explicitly get the default export for express and cors
const expressApp = express;
const corsMiddleware = cors;

const app = expressApp();
const PORT = process.env.PORT || 3000;

// Use cors middleware to allow requests from your Angular app
app.use(corsMiddleware({
  origin: 'http://localhost:4200' // Allow requests from your Angular app's origin
}));

// Battle.net API credentials (replace with your actual client ID and secret)
const CLIENT_ID = process.env.BLIZZARD_CLIENT_ID || '2bafee0abefe4691bbed20c66099c766';
const CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET || '9EssXA3CpHRX5QURoiaIYYIJt3uaNi1u';
const REGION = 'eu'; // Your desired region

let accessToken = null;
let tokenExpiry = 0;

// Function to get or refresh Battle.net access token
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const tokenUrl = `https://${REGION}.battle.net/oauth/token`;
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute before actual expiry
    console.log('New Battle.net access token obtained.');
    return accessToken;
  } catch (error) {
    console.error('Error getting Battle.net access token:', error);
    throw error;
  }
}

// Route to get access token
app.get('/api/wow/token', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ access_token: token });
  } catch (error) {
    console.error('Error in /api/wow/token:', error);
    res.status(500).send('Failed to get access token');
  }
});

// Proxy route for Battle.net API calls
app.get(/^\/api\/wow\/(.*)$/, async (req, res) => {
  try {
    const token = await getAccessToken();
        const battleNetUrl = `https://${REGION}.api.blizzard.com/${req.params[0]}`;
        console.log(`Proxying request to Battle.net API: ${battleNetUrl}`);
    
        const queryParams = new URLSearchParams(req.query).toString();
        const fullBattleNetUrl = `${battleNetUrl}?${queryParams}`;
    
        const response = await fetch(fullBattleNetUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        console.log(`Received response from Battle.net API: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Battle.net API error: ${response.status} ${response.statusText} - ${errorText}`);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
});