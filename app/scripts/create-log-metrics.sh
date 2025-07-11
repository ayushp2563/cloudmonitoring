#!/bin/bash

PROJECT_ID=$(gcloud config get-value project)

# Create log-based metric for application errors
gcloud logging metrics create app_errors \
  --description="Application error count" \
  --log-filter='resource.type="cloud_run_revision" AND jsonPayload.level="error"'

# Create log-based metric for slow requests
gcloud logging metrics create slow_requests \
  --description="Requests slower than 1 second" \
  --log-filter='resource.type="cloud_run_revision" AND jsonPayload.duration>1'

# Create log-based metric for HTTP status codes
gcloud logging metrics create http_status_codes \
  --description="HTTP status code distribution" \
  --log-filter='resource.type="cloud_run_revision" AND jsonPayload.statusCode EXISTS' \
  --value-extractor='EXTRACT(jsonPayload.statusCode)'

echo "Log-based metrics created successfully"