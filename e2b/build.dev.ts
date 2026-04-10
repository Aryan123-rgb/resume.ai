import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'
import * as dotenv from 'dotenv'

dotenv.config()

console.log("E2B KEY:", process.env.E2B_API_KEY ? "Loaded" : "Missing");
async function main() {
  await Template.build(template, 'pdflatex-sandbox-dev', {
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);