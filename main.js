import { readWrite } from "./web3.js";

const from = 58293 - 600;
const to = 58293;

function main() {
  for (let i = from; i <= to; i++) {
    readWrite(i).then(console.log);
  }
}

main();
