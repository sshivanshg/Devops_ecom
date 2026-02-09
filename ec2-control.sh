#!/bin/bash

INSTANCE_ID="i-0e893df6ea4298a4d"
REGION="us-east-1"

# -----------------------------
# Fetch Instance State
# -----------------------------
STATE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text)

# -----------------------------
# Fetch Health Status
# -----------------------------
SYSTEM_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query "InstanceStatuses[0].SystemStatus.Status" \
  --output text 2>/dev/null)

INSTANCE_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query "InstanceStatuses[0].InstanceStatus.Status" \
  --output text 2>/dev/null)

# Handle cases where health data is unavailable
if [ "$SYSTEM_STATUS" = "None" ] || [ -z "$SYSTEM_STATUS" ]; then
  SYSTEM_STATUS="initializing"
fi

if [ "$INSTANCE_STATUS" = "None" ] || [ -z "$INSTANCE_STATUS" ]; then
  INSTANCE_STATUS="initializing"
fi

# -----------------------------
# Health Analysis
# -----------------------------
if [ "$SYSTEM_STATUS" = "ok" ] && [ "$INSTANCE_STATUS" = "ok" ]; then
  HEALTH="[OK]"
  MESSAGE="System Healthy"
else
  HEALTH="[ALERT]"
  MESSAGE="Check System!"
fi

# -----------------------------
# Output Formatting
# -----------------------------
echo "---------------------------------"
echo "Instance ID: $INSTANCE_ID"
echo "State:       $STATE"
echo "Health:      $HEALTH"
echo "Details:     System=$SYSTEM_STATUS | Instance=$INSTANCE_STATUS"
echo "$MESSAGE"
echo "---------------------------------"

