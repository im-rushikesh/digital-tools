#!/usr/bin/env bash
# ==============================================================================
# Tools Digital (adigitaltools.in) - Production VPS Bootstrap & Hardening Script
# Target OS: Ubuntu 22.04 / 24.04 LTS (Hostinger VPS)
# Domain: adigitaltools.in & www.adigitaltools.in
# VPS IP: 195.35.45.57
# Run as: root (e.g., sudo bash server-setup.sh)
# ==============================================================================

set -euo pipefail

# Configuration Variables
DOMAIN="adigitaltools.in"
DEPLOY_USER="deploy"
DEPLOY_GROUP="deploy"
WEB_ROOT="/var/www/${DOMAIN}"
RELEASES_DIR="${WEB_ROOT}/releases"
SHARED_DIR="${WEB_ROOT}/shared"
CURRENT_LINK="${WEB_ROOT}/current"
SSH_PORT="22"

echo "================================================================================"
echo " Starting VPS Bootstrap for ${DOMAIN} (IP: 195.35.45.57)"
echo "================================================================================"

# 1. Sanity Check - Must run as root
if [ "$(id -u)" -ne 0 ]; then
  echo "[-] ERROR: This script must be run as root (or via sudo)." >&2
  exit 1
fi

# 2. System Update & Essential Package Installation
echo "[+] Step 1: Updating package indices and upgrading installed packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y --no-install-recommends \
  curl \
  wget \
  git \
  rsync \
  ufw \
  fail2ban \
  nginx \
  certbot \
  python3-certbot-nginx \
  unattended-upgrades \
  apt-listchanges \
  ca-certificates \
  gnupg \
  logrotate

# 3. Enable Unattended Security Upgrades
echo "[+] Step 2: Configuring automatic unattended security updates..."
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
systemctl enable unattended-upgrades
systemctl restart unattended-upgrades

# 4. Create Unprivileged 'deploy' User
echo "[+] Step 3: Setting up unprivileged deploy user '${DEPLOY_USER}'..."
if ! id "${DEPLOY_USER}" &>/dev/null; then
  useradd -m -s /bin/bash "${DEPLOY_USER}"
  echo "[+] User '${DEPLOY_USER}' created."
else
  echo "[*] User '${DEPLOY_USER}' already exists."
fi

# Lock deploy user password (SSH key only authentication, no password)
passwd -l "${DEPLOY_USER}" || true

# Setup .ssh directory for deploy user
DEPLOY_HOME="/home/${DEPLOY_USER}"
mkdir -p "${DEPLOY_HOME}/.ssh"
chmod 700 "${DEPLOY_HOME}/.ssh"
touch "${DEPLOY_HOME}/.ssh/authorized_keys"
chmod 600 "${DEPLOY_HOME}/.ssh/authorized_keys"
chown -R "${DEPLOY_USER}:${DEPLOY_GROUP}" "${DEPLOY_HOME}/.ssh"

# 5. Directory Layout for Zero-Downtime Atomic Releases
echo "[+] Step 4: Setting up atomic release directory structure at ${WEB_ROOT}..."
mkdir -p "${RELEASES_DIR}" "${SHARED_DIR}"
chown -R "${DEPLOY_USER}:${DEPLOY_GROUP}" "/var/www"
chmod -R 755 "/var/www"

# Create initial placeholder release if current doesn't exist
INITIAL_RELEASE="${RELEASES_DIR}/initial"
if [ ! -d "${INITIAL_RELEASE}" ]; then
  mkdir -p "${INITIAL_RELEASE}"
  cat > "${INITIAL_RELEASE}/index.html" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Tools Digital - Setup In Progress</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b1326; color: #dae2fd; display: grid; place-content: center; height: 100vh; margin: 0; text-align: center; }
    h1 { color: #4fdbc8; font-size: 2.2rem; }
    p { color: #bbcac6; font-size: 1.1rem; }
  </style>
</head>
<body>
  <h1>Tools Digital (adigitaltools.in)</h1>
  <p>Production server provisioned successfully. Awaiting first CI/CD deployment push.</p>
</body>
</html>
EOF
  chown -R "${DEPLOY_USER}:${DEPLOY_GROUP}" "${INITIAL_RELEASE}"
fi

# Atomic symlink initialization
if [ ! -L "${CURRENT_LINK}" ]; then
  ln -sfn "${INITIAL_RELEASE}" "${CURRENT_LINK}"
  chown -h "${DEPLOY_USER}:${DEPLOY_GROUP}" "${CURRENT_LINK}"
fi

# 6. Sudoers rule allowing deploy user to test & reload Nginx ONLY
echo "[+] Step 5: Granting deploy user passwordless sudo strictly for Nginx reload & test..."
cat > /etc/sudoers.d/deploy-nginx <<EOF
# Allow deploy user to validate and reload Nginx without a password
${DEPLOY_USER} ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t, /usr/bin/systemctl reload nginx
EOF
chmod 440 /etc/sudoers.d/deploy-nginx

# 7. Safe Sysctl Kernel Network Hardening
echo "[+] Step 6: Applying safe network & TCP hardening settings..."
cat > /etc/sysctl.d/99-security-hardening.conf <<'EOF'
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Disable ICMP redirect acceptance
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Disable send redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Enable SYN cookies against SYN flood attacks
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2

# Log martian packets (spoofed addresses)
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
EOF
sysctl --system >/dev/null || true

# 8. Configure UFW Firewall
echo "[+] Step 7: Configuring UFW firewall (SSH: ${SSH_PORT}, HTTP: 80, HTTPS: 443)..."
ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow "${SSH_PORT}/tcp" comment "SSH"
ufw allow 80/tcp comment "HTTP (Let's Encrypt / redirect)"
ufw allow 443/tcp comment "HTTPS (Secure Traffic)"
ufw --force enable

# 9. Configure Fail2ban
echo "[+] Step 8: Configuring Fail2ban for SSH and Nginx..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
banaction = ufw

[sshd]
enabled = true
port = ${SSH_PORT}
maxretry = 3
findtime = 10m
bantime = 24h

[nginx-http-auth]
enabled = true

[nginx-botsearch]
enabled = true
EOF
systemctl enable fail2ban
systemctl restart fail2ban

# 10. SSH Hardening (Warning and Safe Application)
echo "[+] Step 9: Applying SSH hardening drop-in..."
mkdir -p /etc/ssh/sshd_config.d
cat > /etc/ssh/sshd_config.d/99-hardened.conf <<EOF
# Tools Digital Production SSH Hardening
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey
KbdInteractiveAuthentication no
X11Forwarding no
MaxAuthTries 4
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

# Validate SSH config syntax before restarting
if sshd -t; then
  systemctl reload ssh || systemctl reload sshd || service ssh reload
  echo "[+] SSH configuration reloaded successfully."
else
  echo "[-] WARNING: sshd test failed! Reverting SSH drop-in to prevent lockout."
  rm -f /etc/ssh/sshd_config.d/99-hardened.conf
fi

echo "================================================================================"
echo "[✓] VPS BOOTSTRAP COMPLETE!"
echo ""
echo "CRITICAL NEXT STEPS:"
echo "1. DO NOT close your current SSH terminal window yet!"
echo "2. Add your ED25519 deploy public key into: ${DEPLOY_HOME}/.ssh/authorized_keys"
echo "3. Copy deploy/nginx.conf to /etc/nginx/sites-available/${DOMAIN}"
echo "4. Enable site: ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/"
echo "5. Run Certbot to acquire SSL certificate:"
echo "   certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "================================================================================"