from flask_mail import Message
from app import mail
from flask import current_app

def send_order_confirmation_email(user_email, order):
    try:
        msg = Message(
            subject='Order Confirmation - Spaising\'s Store',
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[user_email]
        )
        
        msg.body = f"""
        Thank you for your order at Spaising's Store!
        
        Order ID: {order.id}
        Total Amount: ${order.total_amount}
        Order Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}
        
        Shipping Address:
        {order.shipping_address}
        
        We'll notify you when your order ships.
        
        Best regards,
        Spaising's Store Team
        """
        
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False