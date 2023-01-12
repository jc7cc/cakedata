import { Spot } from "@binance/connector";
import { status } from "./utils.js";
// {
//   proxy: {
//     protocol: "socks5",
//     host: "127.0.0.1",
//     port: 7890,
//   },
// }
const client = new Spot();

// all pairs
// client.bookTickerWS(null, callbacks)

function arrToObj(arr) {
  const res = {};
  for (const elem of arr) {
    if (elem.symbol === "CAKEBUSD") {
      res["CAKEBUSD"] = elem.price;
    } else {
      res["CAKEUSDT"] = elem.price;
    }
  }
  return res;
}

export async function getCakePrice() {
  try {
    const res = await client.tickerPrice("", ["CAKEUSDT", "CAKEBUSD"]);
    return {
      status: status.success,
      ...arrToObj(res.data),
      timestamp: +new Date(),
    };
  } catch (err) {
    return {
      status: status.fail,
    };
  }
}
