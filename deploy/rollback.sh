#!/usr/bin/env bash
# ==============================================================================
# Tools Digital (adigitaltools.in) - One-Command Rollback Script
# Switches the 'current' symlink to the previous successful release
# ==============================================================================

set -euo pipefail

DOMAIN="adigitaltools.in"
WEB_ROOT="/var/www/${DOMAIN}"
RELEASES_DIR="${WEB_ROOT}/releases"
CURRENT_LINK="${WEB_ROOT}/current"

echo "[*] Tools Digital Release Rollback Tool"

if [ ! -L "${CURRENT_LINK}" ]; then
  echo "[-] ERROR: Current symlink not found at ${CURRENT_LINK}" >&2
  exit 1
fi

CURRENT_TARGET=$(readlink -f "${CURRENT_LINK}")
echo "[*] Currently active release: ${CURRENT_TARGET}"

# Get releases sorted by modification time (most recent first)
AVAILABLE_RELEASES=($(ls -td "${RELEASES_DIR}"/*))

if [ ${#AVAILABLE_RELEASES[@]} -lt 2 ]; then
  echo "[-] ERROR: Not enough releases available in ${RELEASES_DIR} to perform a rollback." >&2
  exit 1
fi

PREVIOUS_RELEASE=""
for rel in "${AVAILABLE_RELEASES[@]}"; do
  # Resolve path to ensure exact comparison
  REAL_REL=$(readlink -f "$rel")
  if [ "$REAL_REL" != "$CURRENT_TARGET" ]; then
    PREVIOUS_RELEASE="$rel"
    break
  fi
done

if [ -z "${PREVIOUS_RELEASE}" ] || [ ! -d "${PREVIOUS_RELEASE}" ]; then
  echo "[-] ERROR: Could not identify a valid previous release." >&2
  exit 1
fi

echo "[+] Target release for rollback: ${PREVIOUS_RELEASE}"

# Atomic symlink swap
ln -sfn "${PREVIOUS_RELEASE}" "${CURRENT_LINK}"
echo "[+] Swapped ${CURRENT_LINK} -> ${PREVIOUS_RELEASE}"

# Reload Nginx (deploy user uses sudo rule)
echo "[+] Validating and reloading Nginx..."
if command -v sudo &>/dev/null && sudo -n /usr/sbin/nginx -t 2>/dev/null; then
  sudo /usr/bin/systemctl reload nginx
elif [ "$(id -u)" -eq 0 ]; then
  nginx -t && systemctl reload nginx
else
  echo "[!] Notice: Please reload Nginx manually: sudo systemctl reload nginx"
fi

echo "[✓] ROLLBACK SUCCESSFUL! Live site is now running: $(basename "${PREVIOUS_RELEASE}")"