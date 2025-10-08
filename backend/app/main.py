from app import create_app, db
from flask import Flask, jsonify
from flask.cli import with_appcontext
import click

app = create_app()

# Import models after app creation to ensure db is initialized
with app.app_context():
    from app.models import User, Product, Order, OrderItem

# Root route to avoid 404
@app.route("/")
def home():
    return jsonify({"message": "Welcome to SpaisingStore API!"})

# CLI command: Initialize database
@click.command("init-db")
@with_appcontext
def init_db():
    """Initialize the database."""
    db.create_all()
    click.echo("✅ Database initialized!")

# CLI command: Create admin user
@click.command("create-admin")
@with_appcontext
def create_admin():
    """Create an admin user."""
    from app.models.user import User

    existing_admin = User.query.filter_by(email='admin@spaising.com').first()
    if existing_admin:
        click.echo("⚠️ Admin user already exists!")
        return

    admin = User(
        email='admin@spaising.com',
        first_name='Admin',
        last_name='User',
        is_admin=True
    )
    admin.set_password('admin123')

    db.session.add(admin)
    db.session.commit()
    click.echo("✅ Admin user created!")


# Register commands to Flask CLI
app.cli.add_command(init_db)
app.cli.add_command(create_admin)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
