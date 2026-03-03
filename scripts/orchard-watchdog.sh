#!/bin/bash
# ══ OpenClaw Orchard — Watchdog Service ══
# Monitors OpenClaw process. Restarts on failure.
# Setup: sudo systemctl enable orchard-watchdog
# Runs as: systemd service (see watchdog.service)

OPENCLAW_DIR="/opt/orchard/openclaw"
LOG_FILE="/var/log/orchard/watchdog.log"
TELEGRAM_BOT_TOKEN="${TELEGRAM_MANAGER_BOT_TOKEN}"
TELEGRAM_CHAT_ID="${TELEGRAM_CEO_CHAT_ID}"
MAX_RESTART_ATTEMPTS=3
RESTART_COOLDOWN=60  # seconds between restart attempts
restart_count=0

log() {
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1" | tee -a "$LOG_FILE"
}

telegram_alert() {
  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    -d "text=$1" \
    -d "parse_mode=HTML" > /dev/null 2>&1
}

check_openclaw() {
  pgrep -f "openclaw" > /dev/null 2>&1
  return $?
}

restart_openclaw() {
  log "Attempting restart #$((restart_count + 1))..."
  cd "$OPENCLAW_DIR" && npm start &
  sleep 10
  if check_openclaw; then
    log "Restart successful"
    telegram_alert "✅ <b>ORCHARD WATCHDOG</b>: System restarted successfully after failure. Attempt $((restart_count))."
    restart_count=0
    return 0
  else
    log "Restart failed"
    return 1
  fi
}

log "Watchdog started"
telegram_alert "🟢 <b>ORCHARD WATCHDOG</b>: Monitoring started."

while true; do
  if ! check_openclaw; then
    log "OpenClaw process not found!"
    
    if [ $restart_count -lt $MAX_RESTART_ATTEMPTS ]; then
      telegram_alert "⚠️ <b>ORCHARD WATCHDOG</b>: System down. Attempting restart $((restart_count + 1))/$MAX_RESTART_ATTEMPTS..."
      restart_count=$((restart_count + 1))
      
      if restart_openclaw; then
        restart_count=0
      fi
    else
      log "Max restart attempts reached. Manual intervention required."
      telegram_alert "🔴 <b>EMERGENCY: SYSTEM DOWN</b>
OpenClaw has failed $MAX_RESTART_ATTEMPTS restart attempts.
<b>Manual intervention required by Max.</b>
All trading operations are PAUSED.
Check VPS immediately: ssh max@[YOUR_VPS_IP]"
      # Stop trying — wait for manual reset
      sleep 3600
      restart_count=0
    fi
    
    sleep $RESTART_COOLDOWN
  else
    restart_count=0
  fi
  
  sleep 30
done
