#!/bin/bash

# ============================================================
# Google AI Studio / Gemini API Key Fix
# Safe with:
#   bash lab.sh
#   source lab.sh
#
# © ePlus.DEV
# ============================================================

RED=$'\033[0;91m'
GREEN=$'\033[0;92m'
YELLOW=$'\033[0;93m'
BLUE=$'\033[0;94m'
MAGENTA=$'\033[0;95m'
CYAN=$'\033[0;96m'
WHITE=$'\033[0;97m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

line() {
  echo "${CYAN}======================================================================${RESET}"
}

ok() {
  echo "${GREEN}✓ $1${RESET}"
}

warn() {
  echo "${YELLOW}⚠ $1${RESET}"
}

fail() {
  echo "${RED}✗ $1${RESET}"
}

info() {
  echo "${CYAN}→ $1${RESET}"
}

gemini_key_fix() {

  clear

  echo "${MAGENTA}${BOLD}"
  echo "╔════════════════════════════════════════════════════════════════════╗"
  echo "║             GOOGLE AI STUDIO / GEMINI API KEY FIX                ║"
  echo "║                         © ePlus.DEV                               ║"
  echo "╚════════════════════════════════════════════════════════════════════╝"
  echo "${RESET}"

  # ============================================================
  # 1/7 ENVIRONMENT
  # ============================================================

  echo "${BOLD}[1/7] Detecting Google Cloud environment${RESET}"
  line

  PROJECT_ID="$(gcloud config get-value project 2>/dev/null)"
  ACCOUNT="$(gcloud config get-value account 2>/dev/null)"

  if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "(unset)" ]]; then
    warn "No active project detected."

    read -r -p "Enter Qwiklabs Project ID: " PROJECT_ID

    if [[ -z "$PROJECT_ID" ]]; then
      fail "Project ID cannot be empty."
      return 1
    fi

    gcloud config set project "$PROJECT_ID" >/dev/null 2>&1 || {
      fail "Unable to set project."
      return 1
    }
  fi

  echo "Project : ${GREEN}${PROJECT_ID}${RESET}"
  echo "Account : ${GREEN}${ACCOUNT}${RESET}"
  echo

  if [[ "$PROJECT_ID" == qwiklabs-gcp-* ]]; then
    ok "Qwiklabs project detected."
  else
    warn "Active project does not look like a Qwiklabs project."
  fi

  echo

  # ============================================================
  # 2/7 ENABLE APIS
  # ============================================================

  echo "${BOLD}[2/7] Enabling required APIs${RESET}"
  line

  info "Enabling API Keys, Gemini, IAM and Service Usage APIs"

  gcloud services enable \
    apikeys.googleapis.com \
    generativelanguage.googleapis.com \
    iam.googleapis.com \
    serviceusage.googleapis.com \
    --project="$PROJECT_ID" \
    --quiet

  if [[ $? -ne 0 ]]; then
    fail "Unable to enable required APIs."
    return 1
  fi

  ok "Required APIs enabled."
  echo

  # ============================================================
  # 3/7 SERVICE ACCOUNT
  # ============================================================

  echo "${BOLD}[3/7] Preparing service account${RESET}"
  line

  PROJECT_NUMBER="$(
    gcloud projects describe "$PROJECT_ID" \
      --format="value(projectNumber)" \
      2>/dev/null
  )"

  if [[ -z "$PROJECT_NUMBER" ]]; then
    fail "Unable to determine project number."
    return 1
  fi

  echo "Project number : $PROJECT_NUMBER"

  DEFAULT_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
  CUSTOM_SA_NAME="gemini-api"
  CUSTOM_SA="${CUSTOM_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

  if gcloud iam service-accounts describe "$DEFAULT_SA" \
      --project="$PROJECT_ID" >/dev/null 2>&1; then

    SA_EMAIL="$DEFAULT_SA"

    ok "Using existing service account:"
    echo "$SA_EMAIL"

  elif gcloud iam service-accounts describe "$CUSTOM_SA" \
      --project="$PROJECT_ID" >/dev/null 2>&1; then

    SA_EMAIL="$CUSTOM_SA"

    ok "Using existing Gemini service account:"
    echo "$SA_EMAIL"

  else

    info "Creating Gemini service account..."

    gcloud iam service-accounts create "$CUSTOM_SA_NAME" \
      --project="$PROJECT_ID" \
      --display-name="Gemini API" \
      --quiet

    if [[ $? -ne 0 ]]; then
      fail "Unable to create service account."
      return 1
    fi

    SA_EMAIL="$CUSTOM_SA"
    ok "Service account created."
  fi

  echo

  # ============================================================
  # 4/7 CHECK EXISTING KEYS
  # ============================================================

  echo "${BOLD}[4/7] Checking existing Gemini API keys${RESET}"
  line

  KEY_NAME="$(
    gcloud services api-keys list \
      --project="$PROJECT_ID" \
      --filter='displayName="Gemini API ePlus.DEV"' \
      --sort-by='~createTime' \
      --limit=1 \
      --format='value(name)' \
      2>/dev/null
  )"

  if [[ -n "$KEY_NAME" ]]; then

    ok "Existing Gemini API key found."
    echo
    echo "Key resource:"
    echo "$KEY_NAME"

  else
    info "No existing matching key found."
  fi

  echo

  # ============================================================
  # 5/7 CREATE KEY
  # ============================================================

  echo "${BOLD}[5/7] Creating Gemini authorization API key${RESET}"
  line

  OPERATION=""

  if [[ -z "$KEY_NAME" ]]; then

    info "Creating authorization key..."
    echo
    echo "Service account:"
    echo "$SA_EMAIL"
    echo

    CREATE_OUTPUT="$(
      gcloud services api-keys create \
        --project="$PROJECT_ID" \
        --display-name="Gemini API ePlus.DEV" \
        --service-account="$SA_EMAIL" \
        --api-target="service=generativelanguage.googleapis.com" \
        --format="value(name)" \
        --quiet \
        2>&1
    )"

    CREATE_STATUS=$?

    if [[ $CREATE_STATUS -ne 0 ]]; then
      fail "API key creation failed."
      echo
      echo "$CREATE_OUTPUT"
      return 1
    fi

    RESOURCE="$(echo "$CREATE_OUTPUT" | grep -E '^(operations/|projects/)' | tail -1)"

    if [[ "$RESOURCE" == operations/* ]]; then

      OPERATION="$RESOURCE"

      ok "API key creation operation started."
      echo
      echo "Operation:"
      echo "$OPERATION"

    elif [[ "$RESOURCE" == projects/*/locations/*/keys/* ]]; then

      KEY_NAME="$RESOURCE"

      ok "API key created."
      echo
      echo "Key resource:"
      echo "$KEY_NAME"

    else

      warn "Unable to identify create output."
      echo
      echo "$CREATE_OUTPUT"

      # Fallback: wait then search by display name
      sleep 3
    fi

  else
    info "Using existing API key."
  fi

  echo

  # ============================================================
  # 6/7 RESOLVE OPERATION + GET KEY STRING
  # ============================================================

  echo "${BOLD}[6/7] Resolving API key${RESET}"
  line

  API_KEY=""

  # ------------------------------------------------------------
  # Poll API Keys long-running operation
  # ------------------------------------------------------------

  if [[ -n "$OPERATION" ]]; then

    info "Waiting for API Keys operation to complete..."
    echo

    OP_COMPLETED=false

    for ATTEMPT in {1..30}; do

      TOKEN="$(gcloud auth print-access-token 2>/dev/null)"

      if [[ -z "$TOKEN" ]]; then
        fail "Unable to obtain Google Cloud access token."
        return 1
      fi

      OP_JSON="$(
        curl -sS \
          --connect-timeout 10 \
          --max-time 20 \
          -H "Authorization: Bearer $TOKEN" \
          "https://apikeys.googleapis.com/v2/${OPERATION}"
      )"

      OP_ERROR="$(echo "$OP_JSON" | jq -r '.error.message // empty')"

      if [[ -n "$OP_ERROR" ]]; then
        echo
        fail "API key operation failed:"
        echo "$OP_ERROR"
        return 1
      fi

      DONE="$(echo "$OP_JSON" | jq -r '.done // false')"

      if [[ "$DONE" == "true" ]]; then

        printf "\r%-80s\r"

        KEY_NAME="$(echo "$OP_JSON" | jq -r '.response.name // empty')"
        API_KEY="$(echo "$OP_JSON" | jq -r '.response.keyString // empty')"

        OP_COMPLETED=true

        ok "API key operation completed."

        break
      fi

      printf "\r${YELLOW}→ Processing API key... attempt %02d/30${RESET}" "$ATTEMPT"

      sleep 4
    done

    printf "\r%-80s\r"

    if [[ "$OP_COMPLETED" != "true" ]]; then
      fail "Timed out waiting for API key operation."
      warn "Terminal remains active."
      return 1
    fi

  fi

  # ------------------------------------------------------------
  # Fallback lookup by display name
  # ------------------------------------------------------------

  if [[ -z "$KEY_NAME" ]]; then

    info "Looking up created API key..."

    for ATTEMPT in {1..12}; do

      KEY_NAME="$(
        gcloud services api-keys list \
          --project="$PROJECT_ID" \
          --filter='displayName="Gemini API ePlus.DEV"' \
          --sort-by='~createTime' \
          --limit=1 \
          --format='value(name)' \
          2>/dev/null
      )"

      if [[ -n "$KEY_NAME" ]]; then
        break
      fi

      printf "\r${YELLOW}→ Waiting for key resource... %02d/12${RESET}" "$ATTEMPT"

      sleep 5
    done

    printf "\r%-80s\r"
  fi

  if [[ -z "$KEY_NAME" ]]; then
    fail "Unable to resolve API key resource."
    return 1
  fi

  echo
  echo "Key resource:"
  echo "${GREEN}${KEY_NAME}${RESET}"
  echo

  # ------------------------------------------------------------
  # Retrieve key if operation response didn't include keyString
  # ------------------------------------------------------------

  if [[ -z "$API_KEY" ]]; then

    info "Retrieving API key string..."

    for ATTEMPT in {1..12}; do

      API_KEY="$(
        gcloud services api-keys get-key-string "$KEY_NAME" \
          --project="$PROJECT_ID" \
          --format="value(keyString)" \
          2>/dev/null
      )"

      if [[ -n "$API_KEY" ]]; then
        break
      fi

      printf "\r${YELLOW}→ Retrieving API key... attempt %02d/12${RESET}" "$ATTEMPT"

      sleep 5
    done

    printf "\r%-80s\r"
  fi

  if [[ -z "$API_KEY" ]]; then
    fail "Unable to retrieve API key string."
    return 1
  fi

  ok "API key retrieved."

  export GEMINI_API_KEY="$API_KEY"

  echo

  # ============================================================
  # 7/7 TEST GEMINI
  # ============================================================

  echo "${BOLD}[7/7] Testing Gemini API${RESET}"
  line

  TEST_FILE="/tmp/gemini-test-$$.json"

  HTTP_CODE="$(
    curl -sS \
      --connect-timeout 15 \
      --max-time 30 \
      -o "$TEST_FILE" \
      -w "%{http_code}" \
      "https://generativelanguage.googleapis.com/v1beta/models" \
      -H "x-goog-api-key: $API_KEY"
  )"

  echo "HTTP status : $HTTP_CODE"
  echo

  if [[ "$HTTP_CODE" == "200" ]]; then
    ok "Gemini API authentication successful."
  else
    warn "Gemini API returned HTTP $HTTP_CODE."
    echo
    cat "$TEST_FILE"
    echo
  fi

  rm -f "$TEST_FILE"

  echo
  line
  echo "${GREEN}${BOLD}GEMINI API KEY READY${RESET}"
  line

  echo
  echo "${BOLD}Project:${RESET}"
  echo "$PROJECT_ID"

  echo
  echo "${BOLD}Service account:${RESET}"
  echo "$SA_EMAIL"

  echo
  echo "${BOLD}Key resource:${RESET}"
  echo "$KEY_NAME"

  echo
  echo "${BOLD}API key:${RESET}"
  echo "${GREEN}${API_KEY}${RESET}"

  echo
  ok "GEMINI_API_KEY exported in current terminal."

  echo
  line
  echo "${MAGENTA}${BOLD}© ePlus.DEV${RESET}"
  line

  return 0
}

gemini_key_fix

RESULT=$?

echo

if [[ $RESULT -ne 0 ]]; then
  warn "Script stopped because a step failed."
  ok "Cloud Shell terminal remains active."
fi

# IMPORTANT:
# No exit command here.
