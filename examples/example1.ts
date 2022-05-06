import { BanchoClient } from '../src/bancho.js'
import { agent } from '../src/utils.js';

async function main() {
  const client = new BanchoClient({
    uri: 'http://localhost',
    cfg: process.env.ACCOUNT_CONFIG!
  }, { agent: agent() })
  // await client.osuSession();
  await client.banchoConnect();
}

main()
  .then(() => {
    console.log("Done");
    process.exit(1);
  })
  .catch((err) => {
    console.error(err);
  });
