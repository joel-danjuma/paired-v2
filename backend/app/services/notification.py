from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from typing import List

class NotificationService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.smtp_user,
            MAIL_PASSWORD=settings.smtp_password,
            MAIL_FROM=settings.smtp_user,
            MAIL_PORT=settings.smtp_port,
            MAIL_SERVER=settings.smtp_host,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )
        self.mail = FastMail(self.conf)

    async def send_welcome_email(self, email: str, first_name: str):
        """Send welcome email to new users"""
        html = f"""
        <html>
            <body>
                <h1>Welcome to Paired!</h1>
                <p>Hi {first_name},</p>
                <p>Welcome to Paired - your intelligent roommate matching platform!</p>
                <p>We're excited to help you find the perfect roommate match.</p>
                <p>Get started by completing your profile and setting your preferences.</p>
                <br>
                <p>Best regards,<br>The Paired Team</p>
            </body>
        </html>
        """
        
        message = MessageSchema(
            subject="Welcome to Paired!",
            recipients=[email],
            body=html,
            subtype="html"
        )
        
        await self.mail.send_message(message)

    async def send_password_reset_email(self, email: str, reset_token: str):
        """Send password reset email"""
        reset_link = f"https://paired.com/reset-password?token={reset_token}"
        
        html = f"""
        <html>
            <body>
                <h1>Password Reset Request</h1>
                <p>You requested a password reset for your Paired account.</p>
                <p>Click the link below to reset your password:</p>
                <a href="{reset_link}">Reset Password</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>The Paired Team</p>
            </body>
        </html>
        """
        
        message = MessageSchema(
            subject="Password Reset - Paired",
            recipients=[email],
            body=html,
            subtype="html"
        )
        
        await self.mail.send_message(message)

    async def send_match_notification_email(self, email: str, first_name: str, match_count: int):
        """Send email notification about new matches"""
        html = f"""
        <html>
            <body>
                <h1>New Matches Found!</h1>
                <p>Hi {first_name},</p>
                <p>Great news! We found {match_count} new potential roommate matches for you.</p>
                <p>Login to your Paired account to view your matches and start connecting!</p>
                <a href="https://paired.com/matches">View Matches</a>
                <br><br>
                <p>Best regards,<br>The Paired Team</p>
            </body>
        </html>
        """
        
        message = MessageSchema(
            subject=f"You have {match_count} new matches!",
            recipients=[email],
            body=html,
            subtype="html"
        )
        
        await self.mail.send_message(message)

    async def send_verification_email(self, email: str, verification_token: str):
        """Send email verification"""
        verification_link = f"https://paired.com/verify-email?token={verification_token}"
        
        html = f"""
        <html>
            <body>
                <h1>Verify Your Email</h1>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="{verification_link}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <br>
                <p>Best regards,<br>The Paired Team</p>
            </body>
        </html>
        """
        
        message = MessageSchema(
            subject="Verify Your Email - Paired",
            recipients=[email],
            body=html,
            subtype="html"
        )
        
        await self.mail.send_message(message)

notification_service = NotificationService() 