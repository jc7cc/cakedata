import pg from "pg";
import { config } from "./config.js";
const { Pool } = pg;

export const pool = new Pool(config.db);

const insert = `insert into cake_predict (info) values ($1)`;

export function write(info) {
  pool.query(insert, [info]).catch((err) => console.log(err));
}
