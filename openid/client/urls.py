from django.conf.urls import include, url
from django.urls import path
from client import views

app_name = 'client'
urlpatterns = [
    # Đăng nhập
    path('', views.user_login, name='login'),

    # Kích hoạt tài khoản email
    url(r'^activate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        views.activate, name='activate'),

    # Đặt lại mật khẩu
    url(r'^resetpassword/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        views.resetpwd, name='resetpassword'),

    # Đăng xuất
    path('logout', views.user_logout, name='logout'),

    path('home', views.home, name='home'),
]