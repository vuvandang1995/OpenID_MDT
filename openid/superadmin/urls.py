from django.conf.urls import include, url
from django.urls import path
from . import views

app_name = 'superadmin'

urlpatterns = [
    # trang chỉnh sửa thông tin OpenStack
    path('home', views.home, name='home'),

    # chỉnh sửa thông tin tìa khoản admin
    path('profile/', views.user_profile, name='profile'),
]