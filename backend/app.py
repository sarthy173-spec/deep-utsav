"""Deep Utsav demo API. Prices are integer paise, never client-supplied."""
import json
import os
from pathlib import Path
import sqlite3
from uuid import uuid4, UUID
from flask import Flask, jsonify, request, send_from_directory

BASE = Path(__file__).resolve().parent
PRODUCTS = json.loads((BASE / 'products.json').read_text(encoding='utf-8'))
CATALOG = {p['id']: p for p in PRODUCTS}

def create_app(test_config=None):
    app = Flask(__name__, static_folder=None)
    app.config.update(MAX_CONTENT_LENGTH=16*1024, DATABASE=os.getenv('DATABASE_PATH', str(BASE / 'data' / 'orders.db')), FRONTEND_DIR=str(BASE.parent / 'frontend' / 'dist'))
    if test_config:
        app.config.update(test_config)
    Path(app.config['DATABASE']).parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(app.config['DATABASE']) as db:
        db.execute('CREATE TABLE IF NOT EXISTS orders (request_id TEXT PRIMARY KEY, payload TEXT NOT NULL, receipt TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')

    @app.after_request
    def headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['X-Frame-Options'] = 'DENY'
        if request.path.startswith('/api/'):
            response.headers['Cache-Control'] = 'no-store'
        return response

    @app.get('/api/health')
    def health():
        return jsonify(status='ok')

    @app.get('/api/products')
    def products():
        return jsonify(PRODUCTS)

    @app.post('/api/orders')
    def order():
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify(error='Send a JSON object.'), 400
        try:
            request_id = str(UUID(data.get('request_id', '')))
        except (ValueError, TypeError, AttributeError):
            return jsonify(error='A valid request_id is required.'), 400
        items = data.get('items')
        if not isinstance(items, list) or not 1 <= len(items) <= len(CATALOG):
            return jsonify(error='Choose between 1 and 4 different products.'), 400
        checked, seen, subtotal = [], set(), 0
        for item in items:
            if not isinstance(item, dict):
                return jsonify(error='Each item must be an object.'), 400
            product_id, quantity = item.get('id'), item.get('quantity')
            if type(product_id) is not int or product_id not in CATALOG or product_id in seen:
                return jsonify(error='Unknown or duplicate product.'), 400
            if type(quantity) is not int or not 1 <= quantity <= 10:
                return jsonify(error='Quantity must be an integer from 1 to 10.'), 400
            seen.add(product_id)
            product = CATALOG[product_id]
            subtotal += product['price_paise'] * quantity
            checked.append(dict(id=product_id, quantity=quantity))
        payload = json.dumps(sorted(checked, key=lambda i:i['id']), sort_keys=True)
        delivery = 0 if subtotal >= 99900 else 5900
        receipt = dict(order_id='DU-' + uuid4().hex[:12].upper(), subtotal_paise=subtotal, shipping_paise=delivery, total_paise=subtotal+delivery, demo=True, items=checked)
        with sqlite3.connect(app.config['DATABASE'], timeout=10) as db:
            db.execute('BEGIN IMMEDIATE')
            old = db.execute('SELECT payload, receipt FROM orders WHERE request_id=?', (request_id,)).fetchone()
            if old:
                if old[0] != payload:
                    return jsonify(error='This request ID was already used for a different cart.'), 409
                return jsonify(json.loads(old[1])), 200
            db.execute('INSERT INTO orders (request_id,payload,receipt) VALUES (?,?,?)', (request_id,payload,json.dumps(receipt)))
            # Keep demo storage bounded. This is not a production order ledger.
            db.execute('DELETE FROM orders WHERE rowid NOT IN (SELECT rowid FROM orders ORDER BY rowid DESC LIMIT 1000)')
        return jsonify(receipt), 201

    @app.get('/')
    def home():
        return send_from_directory(app.config['FRONTEND_DIR'], 'index.html')

    @app.get('/<path:path>')
    def assets(path):
        if path.startswith('api/'):
            return jsonify(error='Endpoint not found.'), 404
        return send_from_directory(app.config['FRONTEND_DIR'], path)

    @app.errorhandler(413)
    def too_large(error):
        return jsonify(error='Request is too large.'), 413

    return app

if __name__ == '__main__':
    create_app().run(host='127.0.0.1', port=8000, debug=False)
