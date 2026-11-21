/* eslint-disable @typescript-eslint/no-require-imports */
const autocannon = require("autocannon");

const targetUrl = process.env.TARGET_URL || "http://localhost:3000";
const connections = parseInt(process.env.CONNECTIONS || "200", 10);
const duration = parseInt(process.env.DURATION || "10", 10);

console.log(`Starting load test on ${targetUrl}...`);
console.log(`Connections: ${connections} concurrent users`);
console.log(`Duration: ${duration} seconds`);

const instance = autocannon(
  {
    url: targetUrl,
    connections,
    duration,
    pipelining: 1,
    headers: {
      "User-Agent": "UGG-Load-Benchmark/1.0",
      "Connection": "keep-alive",
    },
  },
  (err, result) => {
    if (err) {
      console.error("Load test error:", err);
      process.exit(1);
    }

    console.log("\n==========================================");
    console.log("       UGG BENCHMARK LOAD REPORT         ");
    console.log("==========================================");
    console.log(`Total Requests Sent : ${result.requests.total}`);
    console.log(`Duration (seconds)  : ${result.duration}`);
    console.log(`Requests / second   : ${result.requests.average}`);
    console.log(`Throughput          : ${(result.throughput.average / (1024 * 1024)).toFixed(2)} MB/s`);
    console.log(`p50 Latency (ms)    : ${result.latency.p50}`);
    console.log(`p90 Latency (ms)    : ${result.latency.p90}`);
    console.log(`p95 Latency (ms)    : ${result.latency.p97_5 || result.latency.p90}`);
    console.log(`p99 Latency (ms)    : ${result.latency.p99}`);
    console.log(`2xx Responses       : ${result["2xx"]}`);
    console.log(`Non-2xx Responses   : ${result.non2xx}`);
    console.log(`Socket Errors       : ${result.errors}`);
    console.log(`Timeouts            : ${result.timeouts}`);
    console.log("==========================================");

    const totalFailures = result.non2xx + result.errors + result.timeouts;
    const errorRate = result.requests.total > 0 ? (totalFailures / (result.requests.total + totalFailures)) * 100 : 0;
    console.log(`Error Rate          : ${errorRate.toFixed(2)}%`);

    if (errorRate > 1.0) {
      console.error(`FAILED: Error rate of ${errorRate.toFixed(2)}% exceeds 1.0% tolerance.`);
      process.exit(1);
    } else {
      console.log("PASSED: 200 concurrent users handled successfully under 1% tolerance.");
    }
  }
);

autocannon.track(instance, { renderProgressBar: true });
