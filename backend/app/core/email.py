"""AIMIKO Transactional Email Delivery Service.

Uses Python standard smtplib for zero-dependency Gmail SMTP.
Features the exact ultra-premium, clean light aesthetic matching the AIMIKO Early Access design specification.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_preregistration_otp(to_email: str, recipient_name: str, otp_code: str) -> bool:
    """Send branded AIMIKO Early Access OTP verification email via Gmail SMTP matching the official spec."""
    smtp_user = (getattr(settings, "smtp_user", None) or "").strip()
    smtp_password = (getattr(settings, "smtp_password", None) or "").strip().replace(" ", "")
    resend_key = (getattr(settings, "resend_api_key", None) or "").strip()
    brevo_key = (getattr(settings, "brevo_api_key", None) or "").strip()

    if not (resend_key or brevo_key or (smtp_user and smtp_password)):
        logger.warning(
            f"[EMAIL SERVICE] No email service configured. OTP for {to_email}: {otp_code}. "
            "Set RESEND_API_KEY, BREVO_API_KEY, or SMTP credentials."
        )
        return False

    sender_name = settings.smtp_from_name or "AIMIKO"
    from_header = f"{sender_name} <{smtp_user or 'contactaimiko@gmail.com'}>"
    subject = f"{otp_code} is your AIMIKO verification code"

    display_name = recipient_name.strip() if recipient_name and recipient_name.strip() else "Friend"
    spaced_otp = " ".join(list(otp_code.strip()))
    verify_url = f"http://localhost:8080/preregister?email={to_email}&otp={otp_code}"

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {{font-family: Arial, Helvetica, sans-serif !important;}}
  </style>
  <![endif]-->
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #f7f8fa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }}
    table {{
      border-collapse: separate;
    }}
    .email-container {{
      max-width: 580px;
      margin: 40px auto;
      background: #ffffff;
      border: 1px solid #eef2f6;
      border-radius: 28px;
      box-shadow: 0 12px 36px -8px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
      overflow: hidden;
      padding: 48px 44px 40px 44px;
      text-align: center;
    }}
    .logo {{
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.22em;
      color: #0a0f1d;
      text-transform: uppercase;
      margin: 0 0 24px 0;
      line-height: 1;
    }}
    .badge-pill {{
      display: inline-block;
      background-color: #f3f0ff;
      border: 1px solid rgba(124, 58, 237, 0.16);
      border-radius: 9999px;
      padding: 6px 18px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: #7c3aed;
      text-transform: uppercase;
      margin-bottom: 26px;
    }}
    .heading {{
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #0f172a;
      line-height: 1.22;
      margin: 0 0 14px 0;
    }}
    .subtext {{
      font-size: 15px;
      line-height: 1.6;
      color: #64748b;
      margin: 0 auto 30px auto;
      max-width: 450px;
    }}
    .code-box {{
      background: #f4f3ff;
      border: 1px solid #ede9fe;
      border-radius: 22px;
      padding: 30px 24px 26px 24px;
      margin: 0 0 28px 0;
      text-align: center;
    }}
    .code-label {{
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      color: #7c3aed;
      text-transform: uppercase;
      margin-bottom: 12px;
    }}
    .code-digits {{
      font-size: 46px;
      font-weight: 800;
      letter-spacing: 0.28em;
      color: #0f172a;
      line-height: 1.1;
      margin: 0 0 12px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Pro Display', sans-serif;
    }}
    .code-expiry {{
      font-size: 12.5px;
      color: #64748b;
      margin: 0;
    }}
    .btn-wrapper {{
      margin: 0 0 24px 0;
      text-align: center;
    }}
    .verify-btn {{
      display: inline-block;
      background-color: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 34px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
      transition: background-color 0.2s ease;
    }}
    .security-card {{
      background-color: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 10px 18px;
      margin: 0 auto 32px auto;
      display: inline-table;
      vertical-align: middle;
    }}
    .security-table td {{
      vertical-align: middle;
    }}
    .security-icon {{
      font-size: 15px;
      line-height: 1;
      padding-right: 10px;
    }}
    .security-divider {{
      border-left: 1px solid #e2e8f0;
      height: 14px;
      margin: 0 12px;
      display: inline-block;
      vertical-align: middle;
    }}
    .security-text {{
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
      display: inline-block;
      vertical-align: middle;
    }}
    .footer-divider {{
      border-top: 1px solid #f1f5f9;
      margin: 28px 0 20px 0;
    }}
    .footer-copy {{
      font-size: 11.5px;
      color: #94a3b8;
      margin: 0 0 8px 0;
      line-height: 1.5;
    }}
    .footer-link {{
      color: #7c3aed;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
    }}
    @media only screen and (max-width: 600px) {{
      .email-container {{
        margin: 16px 12px !important;
        padding: 32px 20px !important;
        border-radius: 20px !important;
      }}
      .heading {{
        font-size: 26px !important;
      }}
      .code-digits {{
        font-size: 34px !important;
        letter-spacing: 0.2em !important;
      }}
      .verify-btn {{
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 14px 20px !important;
      }}
    }}
  </style>
</head>
<body>
  <div style="background-color: #f7f8fa; padding: 24px 12px;">
    <div class="email-container">
      
      <!-- Top Brand Logo -->
      <div class="logo">&#923; I M I K O</div>

      <!-- Badge -->
      <div>
        <span class="badge-pill">EARLY ACCESS PASS</span>
      </div>

      <!-- Heading -->
      <h1 class="heading">You're almost in, {display_name}.</h1>

      <!-- Body Copy -->
      <p class="subtext">
        Verify your email to join the AIMIKO Founding Member roster and unlock your personalized commemorative digital jersey poster.
      </p>

      <!-- Verification Code Box -->
      <div class="code-box">
        <div class="code-label">YOUR VERIFICATION CODE</div>
        <div class="code-digits">{spaced_otp}</div>
        <p class="code-expiry">This code expires in 15 minutes and can only be used once.</p>
      </div>

      <!-- Security Notice -->
      <div class="security-card">
        <span class="security-icon">&#128737;</span>
        <span class="security-divider"></span>
        <span class="security-text">Keep this code private. AIMIKO will never ask you to share it.</span>
      </div>

      <!-- Divider -->
      <div class="footer-divider"></div>

      <!-- Footer Info -->
      <p class="footer-copy">
        &copy; 2026 AIMIKO &middot; Personal AI Companion &amp; Enterprise Intelligence Platform
      </p>
      <a href="https://www.aimiko.in" class="footer-link" target="_blank">www.aimiko.in</a>

    </div>
  </div>
</body>
</html>"""

    plain_text = f"""AIMIKO — EARLY ACCESS PASS
==================================================
You're almost in, {display_name}.

Verify your email to join the AIMIKO Founding Member roster and unlock your personalized commemorative digital jersey poster.

YOUR VERIFICATION CODE:
    {spaced_otp}

This code expires in 15 minutes and can only be used once.

Keep this code private. AIMIKO will never ask you to share it.
==================================================
© 2026 AIMIKO · Personal AI Companion & Enterprise Intelligence Platform
www.aimiko.in
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_header
    msg["To"] = to_email

    msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    # ─────────────────────────────────────────────────────────────
    # Tier 1: Resend HTTPS API (Port 443 — Unblocked on Render)
    # ─────────────────────────────────────────────────────────────
    resend_key = (getattr(settings, "resend_api_key", None) or "").strip()
    if resend_key:
        try:
            import httpx
            sender_resend = f"{sender_name} <verify@aimiko.in>"


            resp = httpx.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": sender_resend,
                    "to": [to_email],
                    "subject": subject,
                    "html": html_body,
                    "text": plain_text,
                },
                timeout=10.0,
            )
            if resp.status_code in (200, 201):
                logger.info(f"[EMAIL SERVICE - RESEND HTTPS] Verification email sent to {to_email}")
                return True
            else:
                logger.warning(f"[EMAIL SERVICE - RESEND] Error {resp.status_code}: {resp.text}")
        except Exception as exc:
            logger.warning(f"[EMAIL SERVICE - RESEND FAILED] {exc}. Attempting next tier...")

    # ─────────────────────────────────────────────────────────────
    # Tier 2: Brevo HTTPS API (Port 443 — Allows contactaimiko@gmail.com)
    # ─────────────────────────────────────────────────────────────
    brevo_key = (getattr(settings, "brevo_api_key", None) or "").strip()
    if brevo_key:
        try:
            import httpx
            brevo_sender = smtp_user if smtp_user else "contactaimiko@gmail.com"
            resp = httpx.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "api-key": brevo_key,
                    "Content-Type": "application/json",
                    "accept": "application/json",
                },
                json={
                    "sender": {"name": sender_name, "email": brevo_sender},
                    "to": [{"email": to_email, "name": display_name}],
                    "subject": subject,
                    "htmlContent": html_body,
                    "textContent": plain_text,
                },
                timeout=10.0,
            )
            if resp.status_code in (200, 201):
                logger.info(f"[EMAIL SERVICE - BREVO HTTPS] Verification email sent to {to_email}")
                return True
            else:
                logger.warning(f"[EMAIL SERVICE - BREVO] Error {resp.status_code}: {resp.text}")
        except Exception as exc:
            logger.warning(f"[EMAIL SERVICE - BREVO FAILED] {exc}. Attempting next tier...")

    # ─────────────────────────────────────────────────────────────
    # Tier 3: Gmail SMTP Fallback (Port 587)
    # ─────────────────────────────────────────────────────────────
    if smtp_user and smtp_password:
        try:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=12)
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, [to_email], msg.as_string())
            server.quit()
            logger.info(f"[EMAIL SERVICE - SMTP] Verification email delivered to {to_email}")
            return True
        except Exception as exc:
            logger.error(f"[EMAIL SERVICE - SMTP FAILED] {exc}")

    logger.error(f"[EMAIL SERVICE] All email delivery tiers failed or unconfigured for {to_email}")
    return False
