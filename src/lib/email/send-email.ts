// lib/email/send-email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "QRmory <noreply@qrmory.com>";
const SUPPORT_EMAIL = "support@qrmory.com";

interface SubscriptionCanceledData {
  codesDeactivated: number;
  codesRemaining: number;
}

interface CodesDeactivatedData {
  deactivatedCodes: Array<{ title: string; shortcode: string | null }>;
  activeCodes: Array<{ title: string; shortcode: string | null }>;
  totalDeactivated: number;
  freeQuota: number;
}

interface QuotaWarningData {
  currentCount: number;
  maxQuota: number;
  percentUsed: number;
}

interface SubscriptionConfirmedData {
  planName: string;
  dynamicQrQuota: number;
  storageQuota: string;
}

interface PaymentFailedData {
  planName: string;
  nextRetryDate?: string;
}

interface SubscriptionDowngradedData {
  oldPlanName: string;
  newPlanName: string;
  oldQuota: number;
  newQuota: number;
  deactivatedCodes: Array<{ title: string; shortcode: string | null }>;
  activeCodes: Array<{ title: string; shortcode: string | null }>;
}

export async function sendSubscriptionCanceledEmail(
  email: string,
  data: SubscriptionCanceledData
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Your QRmory subscription has ended",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E073E; margin: 0;">QRmory</h1>
  </div>

  <h2 style="color: #1E073E;">Your subscription has ended</h2>

  <p>We're sorry to see you go! Your QRmory subscription has been cancelled.</p>

  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1E073E;">What happens now?</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Your account has been downgraded to the Free plan</li>
      <li>You can still use up to <strong>3 dynamic QR codes</strong></li>
      <li>You currently have <strong>${data.codesRemaining}</strong> active dynamic QR codes</li>
      ${data.codesDeactivated > 0 ? `<li style="color: #dc3545;"><strong>${data.codesDeactivated}</strong> codes have been deactivated</li>` : ""}
    </ul>
  </div>

  <p>Want to reactivate your codes? Upgrade back to a paid plan anytime:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://qrmory.com/dashboard/subscription" style="background-color: #1E073E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Plans</a>
  </div>

  <p style="color: #666; font-size: 14px;">
    If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} QRmory. All rights reserved.
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending subscription canceled email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending subscription canceled email:", error);
    return false;
  }
}

export async function sendCodesDeactivatedEmail(
  email: string,
  data: CodesDeactivatedData
): Promise<boolean> {
  try {
    const deactivatedList = data.deactivatedCodes
      .map(code => `<li><strong>${code.title}</strong>${code.shortcode ? ` (qrmory.com/${code.shortcode})` : ""}</li>`)
      .join("");

    const activeList = data.activeCodes
      .map(code => `<li><strong>${code.title}</strong>${code.shortcode ? ` (qrmory.com/${code.shortcode})` : ""}</li>`)
      .join("");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Important: ${data.totalDeactivated} QR codes have been deactivated`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E073E; margin: 0;">QRmory</h1>
  </div>

  <h2 style="color: #dc3545;">Some of your QR codes have been deactivated</h2>

  <p>Due to your subscription ending, we've had to deactivate some of your dynamic QR codes to fit within the Free plan limit of <strong>${data.freeQuota} codes</strong>.</p>

  <div style="background-color: #fff3f3; border: 1px solid #ffcdd2; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #dc3545;">Deactivated Codes (${data.totalDeactivated})</h3>
    <p style="font-size: 14px; color: #666;">These codes will no longer work when scanned:</p>
    <ul style="margin: 0; padding-left: 20px;">
      ${deactivatedList}
    </ul>
  </div>

  <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2e7d32;">Still Active Codes (${data.activeCodes.length})</h3>
    <p style="font-size: 14px; color: #666;">These codes remain active:</p>
    <ul style="margin: 0; padding-left: 20px;">
      ${activeList}
    </ul>
  </div>

  <div style="background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1565c0;">Want your codes back?</h3>
    <p style="margin-bottom: 0;">Upgrade to a paid plan and all your deactivated codes will be automatically restored!</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://qrmory.com/dashboard/subscription" style="background-color: #1E073E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Restore My Codes</a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} QRmory. All rights reserved.
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending codes deactivated email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending codes deactivated email:", error);
    return false;
  }
}

export async function sendQuotaWarningEmail(
  email: string,
  data: QuotaWarningData
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You're at ${data.percentUsed}% of your QR code quota`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E073E; margin: 0;">QRmory</h1>
  </div>

  <h2 style="color: #f57c00;">You're running low on QR codes</h2>

  <p>Just a heads up - you've used <strong>${data.currentCount}</strong> of your <strong>${data.maxQuota}</strong> dynamic QR codes.</p>

  <div style="background-color: #fff8e1; border: 1px solid #ffcc80; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <div style="background-color: #e0e0e0; border-radius: 4px; height: 20px; overflow: hidden;">
      <div style="background-color: ${data.percentUsed >= 90 ? '#f44336' : '#ff9800'}; height: 100%; width: ${data.percentUsed}%;"></div>
    </div>
    <p style="text-align: center; margin: 10px 0 0 0; font-weight: bold;">${data.percentUsed}% used</p>
  </div>

  <p>Need more space? Upgrade your plan to get more dynamic QR codes:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://qrmory.com/dashboard/subscription" style="background-color: #1E073E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Upgrade Plan</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} QRmory. All rights reserved.
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending quota warning email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending quota warning email:", error);
    return false;
  }
}

export async function sendSubscriptionConfirmedEmail(
  email: string,
  data: SubscriptionConfirmedData
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to QRmory ${data.planName}!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E073E; margin: 0;">QRmory</h1>
  </div>

  <h2 style="color: #2e7d32;">Welcome to ${data.planName}!</h2>

  <p>Thank you for upgrading! Your subscription is now active and you have access to all your new features.</p>

  <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2e7d32;">Your Plan Includes:</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li><strong>${data.dynamicQrQuota}</strong> dynamic QR codes</li>
      <li><strong>${data.storageQuota}</strong> storage space</li>
      <li>Analytics & scan tracking</li>
      <li>Custom QR styling</li>
    </ul>
  </div>

  <p>Any previously deactivated codes have been automatically restored.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://qrmory.com/dashboard" style="background-color: #1E073E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} QRmory. All rights reserved.
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending subscription confirmed email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending subscription confirmed email:", error);
    return false;
  }
}

export async function sendPaymentFailedEmail(
  email: string,
  data: PaymentFailedData
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Action required: Payment failed for your QRmory subscription",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E073E; margin: 0;">QRmory</h1>
  </div>

  <h2 style="color: #dc3545;">Payment Failed</h2>

  <p>We were unable to process your payment for your <strong>${data.planName}</strong> subscription.</p>

  <div style="background-color: #fff3f3; border: 1px solid #ffcdd2; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #dc3545;">What happens next?</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li>We'll automatically retry the payment${data.nextRetryDate ? ` on ${data.nextRetryDate}` : " soon"}</li>
      <li>If payment continues to fail, your subscription will be cancelled</li>
      <li>Your dynamic QR codes may be deactivated</li>
    </ul>
  </div>

  <p>Please update your payment method to avoid any interruption:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://qrmory.com/dashboard/subscription" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Update Payment Method</a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Having trouble? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} QRmory. All rights reserved.
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending payment failed email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending payment failed email:", error);
    return false;
  }
}

export async function sendSubscriptionDowngradedEmail(
  email: string,
  data: SubscriptionDowngradedData
): Promise<boolean> {
  try {
    const hasDeactivatedCodes = data.deactivatedCodes.length > 0;

    const deactivatedList = data.deactivatedCodes
      .map(code => `<li><strong>${code.title}</strong>${code.shortcode ? ` (qrmory.com/${code.shortcode})` : ""}</li>`)
      .join("");

    const activeList = data.activeCodes
      .map(code => `<li><strong>${code.title}</strong>${code.shortcode ? ` (qrmory.com/${code.shortcode})` : ""}</li>`)
      .join("");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: hasDeactivatedCodes
        ? `Plan changed: ${data.deactivatedCodes.length} QR codes have been deactivated`
        : `Your plan has been changed to ${data.newPlanName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E073E; margin: 0;">QRmory</h1>
  </div>

  <h2 style="color: #1E073E;">Your subscription has been updated</h2>

  <p>Your QRmory subscription has been changed from <strong>${data.oldPlanName}</strong> to <strong>${data.newPlanName}</strong>.</p>

  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1E073E;">What's changed?</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Previous quota: <strong>${data.oldQuota}</strong> dynamic QR codes</li>
      <li>New quota: <strong>${data.newQuota}</strong> dynamic QR codes</li>
    </ul>
  </div>

  ${hasDeactivatedCodes ? `
  <div style="background-color: #fff3f3; border: 1px solid #ffcdd2; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #dc3545;">Deactivated Codes (${data.deactivatedCodes.length})</h3>
    <p style="font-size: 14px; color: #666;">These codes will no longer work when scanned:</p>
    <ul style="margin: 0; padding-left: 20px;">
      ${deactivatedList}
    </ul>
  </div>

  <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2e7d32;">Still Active Codes (${data.activeCodes.length})</h3>
    <p style="font-size: 14px; color: #666;">Your newest codes remain active:</p>
    <ul style="margin: 0; padding-left: 20px;">
      ${activeList}
    </ul>
  </div>

  <div style="background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1565c0;">Want your codes back?</h3>
    <p style="margin-bottom: 0;">Upgrade your plan and all your deactivated codes will be automatically restored!</p>
  </div>
  ` : `
  <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2e7d32;">Good news!</h3>
    <p style="margin-bottom: 0;">All your existing QR codes remain active since you're within your new quota limit.</p>
  </div>
  `}

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://qrmory.com/dashboard/subscription" style="background-color: #1E073E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">${hasDeactivatedCodes ? "Restore My Codes" : "View My Subscription"}</a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} QRmory. All rights reserved.
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending subscription downgraded email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending subscription downgraded email:", error);
    return false;
  }
}

// Contact Form Emails

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function sendContactFormThankYouEmail(
  data: ContactFormData
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: "no-reply@qrmory.com",
      to: data.email,
      subject: "Thanks for getting in touch!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E073E; margin: 0;">QRmory</h1>
  </div>

  <h2 style="color: #1E073E;">Thanks for reaching out, ${data.name}!</h2>

  <p>We've received your message and appreciate you taking the time to contact us.</p>

  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1E073E;">What happens next?</h3>
    <p style="margin-bottom: 0;">Our team will review your message and get back to you as soon as possible, typically within 1-2 business days.</p>
  </div>

  <div style="background-color: #f0ebf8; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h4 style="margin-top: 0; color: #666;">Your message:</h4>
    <p style="margin-bottom: 0; white-space: pre-wrap; color: #333;">${data.message}</p>
  </div>

  <p>In the meantime, feel free to explore our features:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://qrmory.com" style="background-color: #1E073E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visit QRmory</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} QRmory. All rights reserved.<br>
    This is an automated response. Please do not reply to this email.
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending contact thank you email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending contact thank you email:", error);
    return false;
  }
}

export async function sendContactFormNotificationEmail(
  data: ContactFormData
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: data.email,
      to: "hello@qrmory.com",
      subject: `New contact form message from ${data.name}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E073E; margin: 0;">QRmory</h1>
    <p style="color: #666; margin: 5px 0 0 0;">New Contact Form Submission</p>
  </div>

  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1E073E;">Contact Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Name:</strong></td>
        <td style="padding: 8px 0;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
        <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
      </tr>
    </table>
  </div>

  <div style="background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1E073E;">Message</h3>
    <p style="margin-bottom: 0; white-space: pre-wrap;">${data.message}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="mailto:${data.email}" style="background-color: #1E073E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reply to ${data.name}</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    Sent from QRmory Contact Form<br>
    ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })} AEST
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending contact notification email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending contact notification email:", error);
    return false;
  }
}
