import binascii
import os
import json
import time
import urllib

from django.contrib.auth.hashers import check_password
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login, logout
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_text

from client.decorator import login_require, client_only
from client.tasks import send_email
from log.log import logger
from superadmin.models import MyUser
from superadmin.forms import UserForm, authenticate, UserResetForm, get_user_email, ResetForm
from superadmin.tokens import account_activation_token


# Login 
def user_login(request):
    if request.user.is_anonymous:
        if request.method == 'POST':
            # Reset mật khẩu
            if 'uemail' in request.POST:
                form = UserResetForm(request.POST)
                if form.is_valid():
                    to_email = form.cleaned_data['uemail']
                    current_site = get_current_site(request)
                    user = get_user_email(to_email)
                    mail_subject = 'Reset password'
                    message = render_to_string('client/reset-password.html', {
                        'user': user,
                        'domain': current_site.domain,
                        'uid': urlsafe_base64_encode(force_bytes(user.id)).decode(),
                        'token': account_activation_token.make_token(user)
                    })
                    # gửi mail sử dụng celery
                    send_email.delay(mail_subject, message, to_email)
                    return render(request, 'client/signup.html', {'mess': 'Please check email to reset your password !'})
                else: 
                    error = ''
                    for field in form:
                        error += field.errors
                    return render(request, 'client/signup.html', {'messdk': error})
            # đăng nhập
            elif 'agentname' and 'agentpass' in request.POST:
                username = request.POST['agentname']
                password = request.POST['agentpass']
                user = authenticate(username=username, password=password)
                if user is not None:
                    if user.is_active:
                        login(request, user)
                        if user.is_adminkvm:
                            return redirect('superadmin:home')
                        else:
                            return redirect('client:home')
                    else: 
                        # return render(request, 'client/signup.html', {'messdk': 'Tài khoản của bạn chưa được kích hoạt'})
                        return render(request, 'client/signup.html', {'messdk': 'Your account is inactive!'})
                else:
                    # return render(request, 'client/signup.html', {'messdk': 'Tên đăng nhập hoặc mật khẩu không chính xác'})
                    return render(request, 'client/signup.html', {'messdk': 'Username or password is invalid!'})
            # Đăng ký
            elif 'email' and 'password2' in request.POST:
                user_form = UserForm(request.POST)
                if user_form.is_valid():
                    current_site = get_current_site(request)
                    user = user_form.save()

                    mail_subject = 'Active account OpenID'
                    message = render_to_string('client/active_acc.html', {
                        'user': user,
                        'domain': current_site.domain,
                        'uid': urlsafe_base64_encode(force_bytes(user.id)).decode(),
                        'token': account_activation_token.make_token(user)
                    })
                    # print(account_activation_token.make_token(user))
                    send_email.delay(mail_subject, message, user.email)
                    return render(request, 'client/signup.html', {'mess': 'Please check email to active your account'})
                else:
                    error = ''
                    for field in user_form:
                        error += field.errors
                    return render(request, 'client/signup.html', {'mess': error})

    else:
        return redirect('client:home')
    return render(request, 'client/signup.html')


# Đăng ký
def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = MyUser.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, ObjectDoesNotExist):
        user = None
    if user is not None and user.is_active == False and account_activation_token.check_token(user, token):
        user.is_active = True
        user.created = timezone.now()
        user.save()
        return render(request, 'client/active_acc2.html')
    else:
        return HttpResponse('Activation link is invalid!')


# Reset password
def resetpwd(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64).decode())
        user = MyUser.objects.get(id=uid)
    except(TypeError, ValueError, OverflowError):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        if request.method == 'POST':
            form = ResetForm(request.POST)
            if form.is_valid():
                user.set_password(form.cleaned_data)
                user.save()
                return redirect('/')
            else:
                return redirect('/')
        return render(request, 'client/form-reset-password.html')
    else:
        return HttpResponse('Activation link is invalid!')



# Đăng xuất
def user_logout(request):
    logout(request)
    return redirect('client:login')


@login_require
@client_only
def home(request):
    user = request.user
    return render(request, 'client/home.html', {'content': user.username})