import tempfile
import unittest
from pathlib import Path
from uuid import uuid4
from app import create_app

class ShopTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.app = create_app({'TESTING':True, 'DATABASE':str(Path(self.tmp.name)/'test.db')})
        self.client = self.app.test_client()
    def send(self, items, key=None):
        return self.client.post('/api/orders', json={'request_id':key or str(uuid4()), 'items':items})
    def test_catalog(self):
        self.assertEqual(len(self.client.get('/api/products').json), 4)
    def test_server_price_and_shipping(self):
        r = self.send([{'id':1,'quantity':2,'price_paise':1}])
        self.assertEqual(r.status_code,201)
        self.assertEqual(r.json['total_paise'],65700)
        self.assertEqual(self.send([{'id':4,'quantity':1}]).json['shipping_paise'],0)
    def test_invalid_quantities_and_products(self):
        for qty in (0,-1,11,1.5,'2',True,None):
            self.assertEqual(self.send([{'id':1,'quantity':qty}]).status_code,400)
        for product in (99,True,'1',[]):
            self.assertEqual(self.send([{'id':product,'quantity':1}]).status_code,400)
        self.assertEqual(self.send([]).status_code,400)
        self.assertEqual(self.send([{'id':1,'quantity':1}]*2).status_code,400)
    def test_retries_are_idempotent(self):
        key = str(uuid4()); items=[{'id':1,'quantity':1}]
        first=self.send(items,key); second=self.send(items,key)
        self.assertEqual(first.json,second.json)
        self.assertEqual(self.send([{'id':1,'quantity':2}],key).status_code,409)
    def test_bad_json_and_unknown_api(self):
        self.assertEqual(self.client.post('/api/orders',json=[]).status_code,400)
        self.assertEqual(self.client.get('/api/missing').status_code,404)
        self.assertEqual(self.client.get('/api/health').json,{'status':'ok'})
    def test_orders_persist_between_app_instances(self):
        key=str(uuid4()); items=[{'id':2,'quantity':1}]
        original=self.send(items,key).json
        another=create_app({'TESTING':True,'DATABASE':self.app.config['DATABASE']}).test_client()
        self.assertEqual(another.post('/api/orders',json={'request_id':key,'items':items}).json,original)

if __name__ == '__main__': unittest.main()
