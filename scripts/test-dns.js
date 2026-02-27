const dns = require('dns').promises;

async function testDns() {
  const hostname = '_mongodb._tcp.ezpc.ooepqkc.mongodb.net';
  console.log(`Resolving SRV record for: ${hostname}`);
  try {
    const addresses = await dns.resolveSrv(hostname);
    console.log('SRV records found:', addresses);
  } catch (err) {
    console.error('DNS Resolution failed:', err);
  }
}

testDns();
