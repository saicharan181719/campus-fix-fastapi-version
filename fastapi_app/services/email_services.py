
import os

import resend
from dotenv import load_dotenv

load_dotenv()


def send_password_reset_email(
    recipient_email: str,
    reset_link: str,
) -> None:
    api_key = os.getenv("RESEND_API_KEY")
    sender_email = os.getenv(
        "RESEND_FROM_EMAIL",
        "onboarding@resend.dev",
    )

    if not api_key:
        raise RuntimeError("RESEND_API_KEY is not configured.")

    resend.api_key = api_key

    resend.Emails.send(
        {
            "from": sender_email,
            "to": [recipient_email],
            "subject": "Reset your Campus Fix password",
            "html": f"""
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Campus Fix — Password Reset</h2>
                    <p>We received a request to reset your Campus Fix password.</p>
                    <p>This link expires in 30 minutes and can only be used once.</p>
                    <p>
                        <a href="{reset_link}"
                           style="display:inline-block;padding:12px 18px;
                                  background:#2563eb;color:#ffffff;
                                  text-decoration:none;border-radius:6px;">
                            Reset Password
                        </a>
                    </p>
                    <p>If you didn't request this, you can ignore this email.</p>
                </div>
            """,
        }
    )
