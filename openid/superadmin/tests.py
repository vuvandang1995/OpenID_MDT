from django.test import TestCase
from superadmin.models import *
# Create your tests here.

class UserTestCase(TestCase):
    def setUp(self):
        MyUser.objects.create_user(username="dangvv", email="dangdiendao@gmail.com", password="123456")
    
    def check_username(self):
        u = MyUser.objects.get(username="dangvv")
        
        self.asserEqual("dangvv", u.clean_username)
