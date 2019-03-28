import json

from django.contrib.auth.hashers import check_password
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.urls import reverse

from client.decorator import login_require, admin_only, client_only
from superadmin.models import *


@login_require
@admin_only
def home(request):
    users = MyUser.objects.all()
    if request.method == 'POST':
        if 'active' in request.POST:
            if request.POST['active'] == 'delete_user':
                try:
                    u = MyUser.objects.get(id=request.POST['userid'])
                    u.delete()
                except:
                    return HttpResponse('Please check again!')
            elif request.POST['active'] == 'edit_user':
                try:
                    u = MyUser.objects.get(id=request.POST['userid'])
                    u.fullname = request.POST['fullname']
                    u.email = request.POST['email']
                    u.phone = request.POST['phone']
                    u.save()
                except:
                    return HttpResponse('Please check again!')
    return render(request, 'openid/home.html', {'users': users})


@login_require
@admin_only
def user_profile(request):
    if request.method == 'POST':
        user = request.user
        if check_password(request.POST['pass1'], user.password):
            user.set_password(request.POST['pass2'])
            user.save()
            return JsonResponse({"status": "Done", "messages": reverse('client:login')})
        else:
            return JsonResponse({"status": "Fail", "messages": 'Mật khẩu không đúng'})
    return render(request, 'openid/profile.html')