import { osuSession } from '../src/requests.js'

async function main() {
  await osuSession(process.env.USERNAME, process.env.PASSWORD_HASH);
}

main()
  .then(() => {
    console.log("Done");
    process.exit(1);
  })
  .catch((err) => {
    console.error(err);
  });
