import { BanchoClient } from '../src/bancho.js'

async function main() {
  const client = new BanchoClient(process.env.USERNAME!, process.env.PASSWORD_HASH!)
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
