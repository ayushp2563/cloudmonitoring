const express = require('express');
const prometheus = require('prom-client');
const winston = require('winston');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});

// Prometheus metrics
const register = new prometheus.Registry();

const httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const httpRequestsInFlight = new prometheus.Gauge({
    name: 'http_requests_in_flight',
    help: 'Number of HTTP requests currently being processed'
});

const appInfo = new prometheus.Gauge({
    name: 'app_info',
    help: 'Application information',
    labelNames: ['version', 'environment']
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestsInFlight);
register.registerMetric(appInfo);

// Set app info
appInfo.set({ version: '1.0.0', environment: process.env.NODE_ENV || 'development' }, 1);

// Middleware for metrics collection
app.use((req, res, next) => {
    const start = Date.now();
    httpRequestsInFlight.inc();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;

        httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
        httpRequestTotal.labels(req.method, route, res.statusCode).inc();
        httpRequestsInFlight.dec();

        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: duration,
            userAgent: req.get('User-Agent')
        });
    });

    next();
});

// Application routes
app.get('/', (req, res) => {
    res.json({
        message: 'Cloud Monitoring Demo Application',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    };

    res.json(healthCheck);
});

app.get('/ready', (req, res) => {
    // Readiness check - could include database connectivity, etc.
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

app.get('/api/users', (req, res) => {
    // Simulate database query delay
    setTimeout(() => {
        res.json({
            users: [
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
            ]
        });
    }, Math.random() * 100);
});

app.get('/api/slow', (req, res) => {
    // Simulate slow endpoint
    setTimeout(() => {
        res.json({ message: 'This is a slow endpoint', processingTime: '2000ms' });
    }, 2000);
});

app.get('/api/error', (req, res) => {
    // Simulate random errors
    if (Math.random() < 0.3) {
        logger.error('Simulated error occurred');
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.json({ message: 'Success' });
    }
});

app.get('/api/cpu-intensive', (req, res) => {
    // Simulate CPU-intensive task
    const iterations = Math.floor(Math.random() * 1000000) + 500000;
    let sum = 0;

    for (let i = 0; i < iterations; i++) {
        sum += Math.sqrt(i);
    }

    res.json({
        result: sum,
        iterations: iterations,
        message: 'CPU-intensive task completed'
    });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        logger.error('Error generating metrics', err);
        res.status(500).end(err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;