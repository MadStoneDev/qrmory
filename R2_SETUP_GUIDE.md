# Cloudflare R2 Setup Guide for QRmory

This guide walks you through setting up Cloudflare R2 storage for video and PDF uploads.

## Why R2?

- **Free egress**: No charges for data transfer out (huge savings for QR codes that get scanned repeatedly)
- **S3-compatible**: Uses standard AWS SDK
- **Cost**: $0.015/GB/month for storage (first 10GB free)
- **Reliable**: Cloudflare's global network

## Step 1: Create a Cloudflare Account

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sign up or log in to your account

## Step 2: Enable R2 Storage

1. In the Cloudflare dashboard, click **R2** in the left sidebar
2. Click **Create bucket**
3. Name your bucket: `qrmory-media`
4. Choose your region (or leave as automatic)
5. Click **Create bucket**

## Step 3: Create API Credentials

1. Go to **R2** > **Overview** > **Manage R2 API Tokens**
2. Click **Create API Token**
3. Configure the token:
   - **Token name**: `qrmory-uploads`
   - **Permissions**: Select **Object Read & Write**
   - **Specify bucket(s)**: Select `qrmory-media`
4. Click **Create API Token**
5. **IMPORTANT**: Copy and save these values immediately (they won't be shown again):
   - Access Key ID
   - Secret Access Key

## Step 4: Get Your Account ID

1. Go to **R2** > **Overview**
2. Your Account ID is displayed in the URL: `dash.cloudflare.com/<account_id>/r2`
3. Or find it in **Account Home** > **Account ID** (right sidebar)
4. bf15a11e936ff51cf879ca45d5959630

## Step 5: Configure Public Access (Optional but Recommended)

For QR code links to work, files need to be publicly accessible:

### Option A: R2.dev Domain (Simplest)
1. Go to **R2** > **qrmory-media** bucket
2. Click **Settings**
3. Under **Public access**, enable **R2.dev subdomain**
4. Your files will be accessible at: `https://pub-<account_id>.r2.dev/<file-path>`
5. https://pub-f094540cfce7496c8b0b766838bdf3ff.r2.dev

### Option B: Custom Domain (Professional)
1. Go to **R2** > **qrmory-media** bucket
2. Click **Settings** > **Public access**
3. Click **Connect domain**
4. Enter your subdomain: `media.qrmory.com` (or your domain)
5. Cloudflare will automatically configure SSL and routing

## Step 6: Add Environment Variables

Add these to your `.env.local` file:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_access_key_id_from_step_3
R2_SECRET_ACCESS_KEY=your_secret_access_key_from_step_3
R2_BUCKET_NAME=qrmory-media

# Optional: Custom domain (if you configured one in Step 5B)
# R2_PUBLIC_URL=https://media.qrmory.com
```

For production (Vercel), add these same variables in your project settings.

## Step 7: Verify Setup

1. Start your development server: `npm run dev`
2. Log in as a Creator or Champion tier user
3. Create a new QR code and select "Video" or "PDF"
4. Upload a test file
5. The upload should succeed and show a public URL

## Cost Estimation

Based on the storage quotas:

| Scenario | Storage Cost | Egress Cost |
|----------|-------------|-------------|
| 100 users × 500MB avg | $0.75/month | **FREE** |
| 1,000 users × 1GB avg | $15/month | **FREE** |
| 10,000 users × 2GB avg | $300/month | **FREE** |

Compare this to other providers where egress would cost hundreds of dollars!

## Troubleshooting

### "Upload failed" error
- Check that all R2 environment variables are set
- Verify the bucket exists and API token has correct permissions
- Check browser console for detailed error messages

### Files not accessible
- Ensure public access is enabled on the bucket
- Check that R2_PUBLIC_URL matches your configuration
- Try the R2.dev subdomain option first

### CORS errors
If you see CORS errors:
1. Go to **R2** > **qrmory-media** > **Settings**
2. Under **CORS policy**, add:
```json
[
  {
    "AllowedOrigins": ["https://qrmory.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Security Notes

- API tokens should never be exposed to the client
- All uploads go through the `/api/upload` route (server-side)
- Files are organized by user ID to prevent unauthorized access
- Storage quotas are enforced server-side

## Next Steps

After setup is complete:
1. Test video uploads with different file sizes
2. Test PDF uploads
3. Verify the landing pages work correctly
4. Monitor your R2 usage in the Cloudflare dashboard
