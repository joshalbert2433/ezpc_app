const dns = require('dns').promises;

async function testWithGoogleDns() {
  const hostname = '_mongodb._tcp.ezpc.ooepqkc.mongodb.net';
  console.log(`Setting DNS to 8.8.8.8 and resolving: ${hostname}`);
  
  // Note: dns.setServers is global for the process
  dns.setServers(['8.8.8.8']);
  
  try {
    const addresses = await dns.resolveSrv(hostname);
    console.log('SRV records found:', addresses);
  } catch (err) {
    console.error('DNS Resolution with 8.8.8.8 failed:', err.message);
  }
}

testWithGoogleDns();
