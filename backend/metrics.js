// backend/metrics.js
import express from "express";
import client from "prom-client";

const metricsRouter = express.Router();
const register = new client.Registry();

// Ejemplo: contador de requests
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Número total de requests HTTP",
});
register.registerMetric(httpRequestsTotal);

// Middleware para contar requests
metricsRouter.use((req, res, next) => {
  httpRequestsTotal.inc();
  next();
});

// Endpoint /metrics
metricsRouter.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export default metricsRouter;
