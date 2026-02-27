const dns = require('dns').promises;

async function testGeneralDns() {
  const hostnames = ['google.com', 'mongodb.com', 'ezpc.ooepqkc.mongodb.net'];
  for (const hostname of hostnames) {
    console.log(`Resolving: ${hostname}`);
    try {
      const addresses = await dns.lookup(hostname);
      console.log(`Result for ${hostname}:`, addresses);
    } catch (err) {
      console.error(`Lookup failed for ${hostname}:`, err.message);
    }
  }
}

testGeneralDns();
