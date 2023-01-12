import Web3 from "web3";
import { config } from "./config.js";
import { oracleABI } from "./abi/oracleABI.js";
import { cakePredictABI } from "./abi/cakePridictABI.js";
import { delay, status } from "./utils.js";
import needle from "needle";
import { write } from "./db.js";
import { getCakePrice } from "./binance.js";

let endpoint;
if (process.argv[2] === "test") {
  endpoint = config.publicRPC;
} else {
  endpoint = config.privateRPC;
}

export const web3 = new Web3(endpoint);

export const oracle = new web3.eth.Contract(oracleABI, config.cakeOracleAddr);

export const cakePredict = new web3.eth.Contract(
  cakePredictABI,
  config.cakePredictionAddr,
);

function ignoreNumKey(obj) {
  Object.keys(obj).forEach(
    (key) => {
      if (!isNaN(+key)) {
        delete obj[key];
      }
    },
  );
  return obj;
}

// async function getRound(epoch) {
//   try {
//     let round = await cakePredict.methods.rounds(epoch).call();
//     round = ignoreNumKey(round);
//     return {
//       status: status.success,
//       ...round,
//     };
//   } catch (err) {
//     return {
//       status: status.fail,
//       err: err,
//     };
//   }
// }

async function getOraclePrice(oracleRound) {
  try {
    let close = await oracle.methods.getRoundData(oracleRound).call();
    let prev = await oracle.methods.getRoundData(
      String(BigInt(oracleRound) - 1n),
    )
      .call();
    close = ignoreNumKey(close);
    prev = ignoreNumKey(prev);
    return {
      status: status.success,
      close: close,
      prev: prev,
    };
  } catch (err) {
    return {
      status: status.fail,
      err: err,
    };
  }
}

let option;

if (process.argv[2] === "test") {
  option = { proxy: "http://127.0.0.1:7890" };
}

async function kline(startTime) {
  const startTimeMs = startTime * 1000;
  const url =
    `https://api.binance.com/api/v3/klines?symbol=CAKEUSDT&interval=1m&startTime=${
      startTimeMs - 2 * 60 * 1000
    }&limit=5`;
  const resp = await needle("get", url, option);

  const data = resp.body;
  for (const elem of data) {
    if (elem[0] - startTimeMs < 0 && elem[6] - startTimeMs > 0) {
      return {
        startTime: elem[0],
        open: elem[1],
        highest: elem[2],
        lowest: elem[3],
        close: elem[4],
        vol: elem[5],
        closeTime: elem[6],
        quoteVol: elem[7],
        tradeCount: elem[8],
        takerVol: elem[9],
        takerQuoteVol: elem[10],
      };
    }
  }
}

export async function getData(epoch) {
  const round = await getRound(epoch);
  if (round.status === status.success) {
    if (round.closeOracleId === "0") {
      return {
        status: status.fail,
      };
    }
    const oraclePrice = await getOraclePrice(round.closeOracleId);
    if (oraclePrice.close.updatedAt === undefined) console.log(round);
    const binancePrice = await kline(oraclePrice.close.updatedAt);
    return {
      status: status.success,
      round: round,
      oraclePrice: oraclePrice,
      binancePrice: binancePrice,
    };
  }
}

export async function readWrite(epoch) {
  const info = await getData(epoch);
  if (info.status === status.success) {
    write(info);
  }
}

async function nextRoundTimeRange() {
  const round = await oracle.methods.latestRoundData().call();
  return {
    roundId: round.roundId,
    updatedAt: round.updatedAt,
    nextRoundRange: [+round.updatedAt + 85, +round.updatedAt + 95],
  };
}

async function getRoundData(roundId) {
  while (true) {
    const curRound = await oracle.methods.getRoundData(roundId).call();
    if (curRound.updatedAt === "0") {
      await delay(0.5);
      continue;
    }
    return ignoreNumKey(curRound);
  }
}

async function getPrice(lastRound) {
  const priceArr = [];
  let time = 0;
  do {
    const cexPrice = await getCakePrice();
    time = cexPrice.timestamp;
    priceArr.push(cexPrice);
    await delay(0.5);
  } while (Math.floor(time / 1000) < lastRound.nextRoundRange[1]);

  const roundId = (BigInt(lastRound.roundId) + 1n).toString();
  const curRound = await getRoundData(roundId);
  return {
    round: curRound,
    binancePrice: priceArr,
  };
}

export async function getRound() {
  const measuredTime = await nextRoundTimeRange();
  const now = Math.floor(+new Date() / 1000);
  console.log(measuredTime);
  setTimeout(async () => {
    const res = await getPrice(measuredTime);
    write(res);
    console.log(res);
    getRound();
  }, (measuredTime.nextRoundRange[0] - now) * 1000);
}
