const axios = require('axios');

async function run() {
  const gatewayUrl = process.env.GATEWAY_URL || 'http://127.0.0.1:3000';
  const email = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;

  console.log(`Checking gateway docs at ${gatewayUrl}/docs`);
  const docsResponse = await axios.get(`${gatewayUrl}/docs`, {
    validateStatus: () => true,
  });
  if (docsResponse.status !== 200) {
    throw new Error(`Gateway docs check failed with status ${docsResponse.status}`);
  }

  console.log('Gateway docs reachable');

  if (!email || !password) {
    console.log('Skipping login check because LOGIN_EMAIL or LOGIN_PASSWORD is not set');
    return;
  }

  console.log('Checking auth login through gateway');
  const loginResponse = await axios.post(
    `${gatewayUrl}/api/auth/login`,
    { email, password },
    { validateStatus: () => true },
  );

  if (loginResponse.status !== 200) {
    throw new Error(`Login failed with status ${loginResponse.status}: ${JSON.stringify(loginResponse.data)}`);
  }

  const accessToken = loginResponse.data?.data?.accessToken || loginResponse.data?.accessToken;
  if (!accessToken) {
    throw new Error('Login succeeded but accessToken was not present in the response');
  }

  console.log('Auth login reachable');
  console.log('Checking user-service through gateway');

  const usersResponse = await axios.get(`${gatewayUrl}/api/users`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    validateStatus: () => true,
  });

  if (usersResponse.status !== 200) {
    throw new Error(`Users endpoint failed with status ${usersResponse.status}: ${JSON.stringify(usersResponse.data)}`);
  }

  console.log('User service reachable through gateway');
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
