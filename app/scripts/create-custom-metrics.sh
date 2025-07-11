#!/bin/bash

PROJECT_ID=$(gcloud config get-value project)

# Create custom metric for response time
gcloud logging metrics create response_time_metric \
  --description="Average response time for HTTP requests" \
  --log-filter='resource.type="cloud_run_revision" AND jsonPayload.duration EXISTS' \
  --value-extractor='EXTRACT(jsonPayload.duration)'

# Create custom metric for error rate
gcloud logging metrics create error_rate_metric \
  --description="HTTP error rate" \
  --log-filter='resource.type="cloud_run_revision" AND jsonPayload.statusCode>=400'

echo "Custom metrics created successfully"