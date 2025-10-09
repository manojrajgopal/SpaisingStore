import os
from threading import Thread
from flask import current_app
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        try:
            # For development - print email to console
            print(f"📧 EMAIL CONTENT:")
            print(f"To: {msg['To']}")
            print(f"Subject: {msg['Subject']}")
            print(f"Body:\n{msg.get_payload()}")
            print("=" * 50)
            
            # In production, you would actually send the email:
            # import smtplib
            # with smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT']) as server:
            #     server.starttls()
            #     server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
            #     server.send_message(msg)
                
        except Exception as e:
            print(f"❌ Email sending failed: {str(e)}")

def send_order_confirmation_email(user_email, order):
    """Send order confirmation email with invoice"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['Subject'] = f"Order Confirmation - #{order.id}"
        msg['From'] = os.getenv('EMAIL_FROM', 'noreply@spaisingstore.com')
        msg['To'] = user_email
        
        # Create HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; }}
                .order-details {{ background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
                th {{ background-color: #f8f9fa; }}
                .total-row {{ font-weight: bold; background-color: #e9ecef; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Spaising's Store</h1>
                    <h2>Order Confirmation</h2>
                </div>
                
                <div class="content">
                    <p>Dear Customer,</p>
                    <p>Thank you for your order! Here are your order details:</p>
                    
                    <div class="order-details">
                        <h3>Order #{order.id}</h3>
                        <p><strong>Order Date:</strong> {order.created_at.strftime('%B %d, %Y %I:%M %p')}</p>
                        <p><strong>Status:</strong> <span style="color: #28a745;">{order.status}</span></p>
                        
                        <h4>Shipping Address:</h4>
                        <p>{order.shipping_address.replace(',', '<br>')}</p>
                        
                        <h4>Order Items:</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
        """
        
        # Add order items
        for item in order.order_items:
            html_content += f"""
                                <tr>
                                    <td>{item.product_name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price:.2f}</td>
                                    <td>${(item.quantity * item.price):.2f}</td>
                                </tr>
            """
        
        # Add total
        html_content += f"""
                                <tr class="total-row">
                                    <td colspan="3"><strong>Total Amount:</strong></td>
                                    <td><strong>${order.total_amount:.2f}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <p>Your order will be processed and shipped within 2-3 business days.</p>
                    <p>You can track your order status by logging into your account.</p>
                    
                    <p>Thank you for shopping with us!</p>
                    <p><strong>The Spaising's Store Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>&copy; 2024 Spaising's Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email asynchronously
        Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()
        
        print(f"✅ Order confirmation email sent to {user_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return False