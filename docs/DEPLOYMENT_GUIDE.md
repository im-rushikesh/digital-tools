# Complete Setup & Production Deployment Guide: Tools Digital (`adigitaltools.in`)

This guide outlines every single step to connect your domain (`adigitaltools.in`), configure your Hostinger VPS (`195.35.45.57`), set up automatic GitHub Actions CI/CD from `https://github.com/im-rushikesh/`, and maintain high security with zero downtime.

---

## 📌 ARCHITECTURE OVERVIEW
- **Domain**: `adigitaltools.in` & `www.adigitaltools.in`
- **VPS Public IPv4**: `195.35.45.57`
- **Web Server**: Hardened Nginx + Let's Encrypt TLS (Certbot)
- **Deployment Strategy**: GitHub Actions runner builds the static output (`dist/`), transfers via `rsync` over SSH into `/var/www/adigitaltools.in/releases/<sha>`, verifies health, and switches the `/var/www/adigitaltools.in/current` symlink atomically.
- **Rollback**: Instant 1-command rollback repointing `current` to the previous release.

---

## 🌐 STEP 1: DOMAIN & DNS CONFIGURATION (Do this first)

You need to point your domain `adigitaltools.in` to your Hostinger VPS IP: `195.35.45.57`.

### Option A: If managing DNS on your Domain Registrar (Hostinger / GoDaddy / Namecheap)
1. Log into your domain management portal.
2. Go to **DNS Management / DNS Zone Editor**.
3. Add / Edit the following two DNS Records:
   - **Type**: `A`
     - **Name / Host**: `@` (or leave empty if apex)
     - **Points to / Value**: `195.35.45.57`
     - **TTL**: `300` (or Default / 1/2 hour)
   - **Type**: `CNAME` (or `A` record)
     - **Name / Host**: `www`
     - **Points to / Value**: `adigitaltools.in` (or `195.35.45.57`)
     - **TTL**: `300`
4. Save changes. (DNS propagation usually takes 5-30 minutes).

### Option B: If using Cloudflare (Recommended for DDoS & Global Caching)
1. In Cloudflare, add your site `adigitaltools.in` and change nameservers at your registrar to Cloudflare's nameservers.
2. Under **DNS Records**, add:
   - `A` record: `@` -> `195.35.45.57` (Proxy status: Proxied or DNS Only during first SSL issuance)
   - `CNAME` record: `www` -> `adigitaltools.in` (Proxied)
3. Under **SSL/TLS**: Set encryption mode to **Full (strict)**.

---

## 🖥️ STEP 2: ONE-TIME VPS BOOTSTRAP & HARDENING

> [!WARNING]
> Keep your initial SSH window open during this step to verify everything before closing!

### 1. Connect to your VPS via SSH from your terminal / PowerShell:
```powershell
ssh root@195.35.45.57
```
*(Enter your VPS root password when prompted)*

### 2. Download and run the bootstrap script:
On the VPS terminal, run:
```bash
# Create deploy directory and run bootstrap script
mkdir -p /root/setup && cd /root/setup

# You can copy deploy/server-setup.sh contents or curl it:
curl -sSL https://raw.githubusercontent.com/im-rushikesh/tools-digital-website/main/deploy/server-setup.sh -o server-setup.sh 2>/dev/null || true

# Run the script:
bash /var/www/adigitaltools.in/../server-setup.sh # (Or run the server-setup.sh script created in the deploy folder)
```

Alternatively, copy the provided `deploy/server-setup.sh` to the VPS:
```bash
bash server-setup.sh
```

This will automatically:
- Upgrade packages and enable automatic unattended security upgrades.
- Create an unprivileged user named `deploy` restricted to `/var/www/adigitaltools.in`.
- Set up directories: `/var/www/adigitaltools.in/releases`, `/var/www/adigitaltools.in/shared`, and `current` symlink.
- Enable UFW firewall (allowing only ports 22, 80, 443).
- Configure Fail2ban for SSH and Nginx.
- Grant `deploy` user passwordless permission ONLY for `sudo nginx -t` and `sudo systemctl reload nginx`.

---

## 🔑 STEP 3: DEDICATED SSH DEPLOY KEY SETUP

We will create a dedicated Ed25519 key pair specifically for GitHub Actions.

### 1. On your Local Computer (PowerShell / Terminal):
Generate a key pair (do NOT overwrite your personal `id_rsa` or `id_ed25519`):
```powershell
ssh-keygen -t ed25519 -C "github-actions-deploy@adigitaltools.in" -f "$HOME/.ssh/deploy_ed25519" -N ""
```
This generates:
- Private Key: `$HOME/.ssh/deploy_ed25519`
- Public Key: `$HOME/.ssh/deploy_ed25519.pub`

### 2. Copy the Public Key to the VPS `deploy` user:
On your local machine, print the public key:
```powershell
Get-Content "$HOME\.ssh\deploy_ed25519.pub"
```
Log into the VPS (as root) and paste it into `/home/deploy/.ssh/authorized_keys`:
```bash
echo "PASTE_PUBLIC_KEY_CONTENT_HERE" >> /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 3. Get your VPS SSH Host Key (`KNOWN_HOSTS`):
On your local computer, get the VPS fingerprint:
```powershell
ssh-keyscan -H -p 22 195.35.45.57
```
Copy the resulting output (lines starting with `195.35.45.57 ssh-ed25519 ...`).

---

## 🔒 STEP 4: CONFIGURE GITHUB SECRETS

1. Open your repository on GitHub: `https://github.com/im-rushikesh/tools-digital-website` (or your repo name).
2. Go to **Settings** -> **Secrets and variables** -> **Actions**.
3. Under **Repository secrets**, click **New repository secret** and add:

| Secret Name | Value |
|---|---|
| `SSH_HOST` | `195.35.45.57` |
| `SSH_USER` | `deploy` |
| `SSH_PORT` | `22` |
| `SSH_PRIVATE_KEY` | Contents of your local `$HOME/.ssh/deploy_ed25519` (Open with Notepad and copy all text including `-----BEGIN OPENSSH PRIVATE KEY-----`) |
| `KNOWN_HOSTS` | Output from `ssh-keyscan -H -p 22 195.35.45.57` |

4. *(Optional & Recommended)*: Go to **Settings** -> **Environments** -> Click **New environment** -> name it `production`.

---

## 📜 STEP 5: ACTIVATE NGINX & SSL CERTIFICATE (On VPS)

On your VPS (as root):
1. Copy the Nginx configuration:
```bash
cp /path/to/deploy/nginx.conf /etc/nginx/sites-available/adigitaltools.in
ln -sf /etc/nginx/sites-available/adigitaltools.in /etc/nginx/sites-enabled/adigitaltools.in
rm -f /etc/nginx/sites-enabled/default
```

2. Generate free SSL Certificate via Certbot:
```bash
certbot --nginx -d adigitaltools.in -d www.adigitaltools.in --non-interactive --agree-tos -m admin@adigitaltools.in
```

3. Test and reload Nginx:
```bash
nginx -t && systemctl reload nginx
```

---

## 💻 STEP 6: VS CODE -> GITHUB -> LIVE WORKFLOW (Daily Development)

### 1. Initialize Git and Push to GitHub (First Time):
In your project folder in VS Code terminal:
```powershell
git init
git add .
git commit -m "feat: initial commit with automated deployment pipeline"
git branch -M main
git remote add origin https://github.com/im-rushikesh/tools-digital-website.git
git push -u origin main
```

### 2. What Happens Automatically on Push:
1. GitHub Actions triggers `.github/workflows/deploy.yml`.
2. The site builds on GitHub's secure runner (`npm ci`, `npm audit`, `npm run build`).
3. The built files are securely transferred to `/var/www/adigitaltools.in/releases/<sha>` over SSH using rsync.
4. Pre-activation health check confirms `index.html` exists.
5. The `current` symlink is atomically switched to the new release (0 downtime).
6. Nginx reloads instantly.
7. Older releases are automatically pruned, keeping only the 5 most recent.

### 3. Local Previewing:
Before pushing code, run locally:
```powershell
npm run dev
```
Open `http://localhost:5173` to verify your changes.

---

## ⏪ STEP 7: ONE-COMMAND EMERGENCY ROLLBACK

If any bad update is pushed or you need to revert instantly to the previous version:
SSH into your VPS and run:
```bash
bash /var/www/adigitaltools.in/rollback.sh
```
Or as deploy user:
```bash
ssh deploy@195.35.45.57 "bash /var/www/adigitaltools.in/rollback.sh"
```
It immediately repoints `/var/www/adigitaltools.in/current` to the previous release and reloads Nginx in < 1 second!

---

## 🛡️ STEP 8: GO-LIVE TEST PLAN & VERIFICATION CHECKLIST

- [ ] **DNS Check**: Run `nslookup adigitaltools.in` -> returns `195.35.45.57`.
- [ ] **SSL & HTTPS Check**: Visit `https://adigitaltools.in` in browser -> Green padlock active.
- [ ] **Security Headers Test**: Test on [securityheaders.com](https://securityheaders.com/?q=adigitaltools.in) -> Grade A/A+.
- [ ] **SSL Labs Test**: Test on [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/analyze.html?d=adigitaltools.in) -> Grade A+.
- [ ] **CI/CD Push Test**: Make a small change (e.g. edit text in `index.html`), commit and push:
  ```powershell
  git commit -am "test: verify live auto deployment"
  git push origin main
  ```
  Watch GitHub Actions tab -> Deployment should turn green within 60 seconds and live site updates instantly without refreshing cache!