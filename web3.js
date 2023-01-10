import Web3 from "web3";
import { config } from "./config.js";

let endpoint;
if (process.argv[2] === "test") {
  endpoint = config.publicRPC;
} else {
  endpoint = config.privateRPC;
}

export const web3 = new Web3(endpoint);

export const oracle = new web3.eth.Contract(oracleABI, config.cakeOracleAddr);

export const cakePredict = new web3.eth.Contract(
  oracleABI,
  config.cakePredictionAddr,
);
