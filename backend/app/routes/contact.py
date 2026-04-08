from html import escape

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
import resend

from app.config import get_settings
from app.limiter import limiter

router = APIRouter(tags=["contact"])
settings = get_settings()


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=5000)


class ContactResponse(BaseModel):
    success: bool
    message: str


@router.post("/contact", response_model=ContactResponse)
@limiter.limit("5/hour")
async def submit_contact(request: Request, body: ContactRequest):
    """
    Submit a contact form message.
    Sends an email notification via Resend.
    """
    if not settings.resend_api_key:
        raise HTTPException(
            status_code=503,
            detail="Email service not configured",
        )

    resend.api_key = settings.resend_api_key

    try:
        # Send notification email to Clay
        resend.Emails.send(
            {
                "from": settings.from_email,
                "to": settings.contact_email,
                "subject": f"New contact from {escape(body.name)}",
                "html": f"""
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> {escape(body.name)}</p>
                <p><strong>Email:</strong> {escape(body.email)}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p>{escape(body.message).replace(chr(10), '<br>')}</p>
                """,
                "reply_to": body.email,
            }
        )

        # Optionally send confirmation to sender
        resend.Emails.send(
            {
                "from": settings.from_email,
                "to": body.email,
                "subject": "Thanks for reaching out!",
                "html": f"""
                <p>Hi {escape(body.name)},</p>
                <p>Thanks for getting in touch! I've received your message and will get back to you soon.</p>
                <p>Best,<br>Clay</p>
                <hr>
                <p style="color: #666; font-size: 12px;">This is an automated confirmation. Please don't reply to this email.</p>
                """,
            }
        )

        return ContactResponse(
            success=True,
            message="Message sent successfully! I'll get back to you soon.",
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to send message. Please try again later.",
        )
