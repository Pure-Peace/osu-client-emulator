import { BanchoClient } from '../src/bancho.js'
import { agent } from '../src/utils.js';

async function main() {
  const client = new BanchoClient({ uri: 'http://localhost', username: process.env.USERNAME!, password: process.env.PASSWORD_HASH! }, { agent: agent() })
  await client.osuSession();
}

main()
  .then(() => {
    console.log("Done");
    process.exit(1);
  })
  .catch((err) => {
    console.error(err);
  });
