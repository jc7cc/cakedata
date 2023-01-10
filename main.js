import { readWrite } from "./web3.js";

const from = 58293 - 1000;
const to = 58293;

function main() {
  for (let i = from; i <= to; i++) {
    readWrite(i);
  }
}

main();
