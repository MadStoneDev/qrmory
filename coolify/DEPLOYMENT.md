# QRmory Coolify Deployment Guide

## 1. Initial Setup in Coolify

1. **Create New Resource** → Application → GitHub
2. Select your QRmory repository
3. Build Pack: **Nixpacks** (auto-detects Next.js)
4. Port: **3000** (Next.js default in production)

## 2. Environment Variables

Add all variables from `.env.example` with your production values.

**Important ones to update:**
```
NEXT_PUBLIC_SITE_URL=https://qrmory.com
NEXT_PUBLIC_CUSTOM_DOMAIN_TARGET=qrmory.com
```

## 3. Domain Configuration

In Coolify App Settings → Domains:
- Add: `qrmory.com`
- Add: `www.qrmory.com`

Coolify auto-provisions SSL via Let's Encrypt.

## 4. Custom Domains Setup

This is the key part. You need Traefik to accept ANY domain and route to QRmory.

### Option A: Coolify UI (Easier)

1. Go to your Coolify instance settings
2. Find Traefik/Proxy configuration
3. Enable "On-Demand TLS" or "Catch-All" routing

### Option B: Docker Labels (More Control)

In Coolify, add these **Docker Labels** to your app:

```
traefik.http.routers.qrmory-catchall.rule=HostRegexp(`{host:.+}`)
traefik.http.routers.qrmory-catchall.priority=1
traefik.http.routers.qrmory-catchall.entrypoints=https
traefik.http.routers.qrmory-catchall.tls=true
traefik.http.routers.qrmory-catchall.tls.certresolver=letsencrypt
```

### Option C: Separate Caddy Proxy (Most Reliable)

If Traefik is tricky, run Caddy alongside:

1. Create a new "Docker Compose" resource in Coolify
2. Use this config:

```yaml
version: '3.8'
services:
  caddy-proxy:
    image: caddy:2-alpine
    ports:
      - "8443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    networks:
      - coolify

volumes:
  caddy_data:

networks:
  coolify:
    external: true
```

Caddyfile:
```
{
    on_demand_tls {
        ask http://qrmory-app:3000/api/domains/check
    }
}

:443 {
    tls {
        on_demand
    }
    reverse_proxy qrmory-app:3000
}
```

## 5. DNS Configuration

Point your main domain to Coolify server:
- `qrmory.com` → A record → YOUR_SERVER_IP
- `www.qrmory.com` → CNAME → qrmory.com

Users' custom domains will point their CNAME to `qrmory.com`.

## 6. Verify Deployment

1. Visit https://qrmory.com - should load the app
2. Test a QR redirect: https://qrmory.com/SHORTCODE
3. Add a test custom domain in dashboard
4. Point test domain CNAME to qrmory.com
5. Verify redirect works from custom domain

## Troubleshooting

**App not starting?**
- Check Coolify logs for build/runtime errors
- Verify all env vars are set

**Custom domain not working?**
- Check DNS propagation: `dig CNAME yourdomain.com`
- Verify domain is verified in QRmory dashboard
- Check Traefik logs for SSL errors

**SSL not provisioning?**
- Let's Encrypt has rate limits - wait if you hit them
- Ensure port 443 is open on firewall
- Check domain DNS is pointing to your server
