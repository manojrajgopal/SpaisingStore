# email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from flask import current_app

def send_order_confirmation_email(user_email, order):
    try:
        # Get email configuration from environment variables
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        email_address = os.getenv('EMAIL_ADDRESS')
        email_password = os.getenv('GOOGLE_ACCESS_TOKEN')
        
        if not email_address:
            print("⚠️ EMAIL_ADDRESS not configured")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['Subject'] = 'Order Confirmation - Spaising\'s Store'
        msg['From'] = email_address
        msg['To'] = user_email
        
        # Email body
        body = f"""
        Thank you for your order at Spaising's Store!
        
        Order ID: {order.id}
        Total Amount: ${order.total_amount:.2f}
        Order Date: {order.created_at.strftime('%Y-%m-%d %H:%M') if order.created_at else 'N/A'}
        
        Shipping Address:
        {order.shipping_address}
        
        We'll notify you when your order ships.
        
        Best regards,
        Spaising's Store Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Enable security
            server.login(email_address, email_password)
            server.send_message(msg)
        
        print(f"✅ Order confirmation email sent to {user_email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False