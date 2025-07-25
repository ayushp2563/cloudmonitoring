# Cloud Monitoring and QoS Project

## Project Overview
This project implements and compares cloud monitoring tools for QoS measurement.

## Structure
- `app/` - Sample application with monitoring
- `monitoring/` - Prometheus, Grafana configurations
- `terraform/` - Infrastructure as Code
- `load-tests/` - Performance testing scripts
- `dashboards/` - Dashboard configurations
- `docs/` - Documentation and reports

## Quick Start
1. Follow setup instructions in docs/setup.md
2. Deploy sample application
3. Configure monitoring tools
4. Run load tests
5. Analyze results

## Team Members
- Vraj Patel (0466216)
- Sahil Bhanderi (0464937)
- Varun Desai (0458891)
- Ayushkumar P. Prajapati (0454521)#   c l o u d m o n i t o r i n g 
 
 

#How to run project

# Quick verification (run this before starting)
docker-compose ps
curl http://localhost:8080/health
curl http://localhost:9090/api/v1/targets

# Display all running containers
docker-compose ps

# Show service URLs
echo "Application: http://localhost:8080"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001"
echo "AlertManager: http://localhost:9093"

# Show current metrics
curl http://localhost:3000/metrics | grep -E "(http_requests_total|http_request_duration)"

# Redirect to Graphana and show current metrics

# Generate normal load
hey -n 100 -c 5 http://localhost:3000/api/users

# Show real-time metrics update in Grafana
# Switch to Grafana tab and show metrics changing

# Test slow endpoint
hey -n 50 -c 5 http://localhost:3000/api/slow

# Generate errors
hey -n 100 -c 10 http://localhost:3000/api/error

# CPU intensive test
hey -n 30 -c 3 http://localhost:3000/api/cpu-intensive

# Show Prometheus Queries:
rate(http_requests_total[5m])
histogram_quantile(0.95, http_request_duration_seconds_bucket)
rate(http_requests_total{status_code!~"2.."}[5m])


# Display alert rules
cat prometheus/alert-rules.yml

Prometheus Alerts (http://localhost:9090/alerts)

Show configured alerts
Display current status


AlertManager Interface (http://localhost:9093)

Show alert management

# Trigger Alerts
# Generate high load to trigger latency alert
hey -n 1000 -c 50 http://localhost:3000/api/slow

# Generate errors to trigger error rate alert
hey -n 500 -c 25 http://localhost:3000/api/error
