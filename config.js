import dotenv from "dotenv";

dotenv.config();

let host;

if (process.argv[2] === "test") {
  host = process.env.DB_HOST_TEST;
} else {
  host = process.env.DB_HOST;
}

export const config = {
  publicRPC: process.env.PUBLIC_RPC,
  privateRPC: process.env.PRIVATE_RPC,
  cakePredictionAddr: process.env.CAKE_PREDICTION,
  cakeOracleAddr: process.env.CAKE_ORACLE,

  db: {
    user: process.env.DB_USER,
    host: host,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
};
