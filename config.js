import dotenv from "dotenv";

dotenv.config();

export const config = {
  publicRPC: process.env.PUBLIC_RPC,
  privateRPC: process.env.PRIVATE_RPC,
  cakePredictionAddr: process.env.CAKE_PREDICTION,
  cakeOracleAddr: process.env.CAKE_ORACLE,
};
