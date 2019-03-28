from django.shortcuts import redirect

from log.log import logger


def login_require(func):
    """
    Check xem user đã login hay chưa có thể dùng decorator mặc định của Django thay thế
    :param func:
    :return:
    """
    def wrapper(request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return redirect('client:login')
        elif user.is_adminkvm:
            return func(request, *args, **kwargs)
        else:
            return func(request, *args, **kwargs)
    return wrapper


def client_only(func):
    """
    Check tài khoản client
    :param func:
    :return:
    """
    def wrapper(request, *args, **kwargs):
        user = request.user
        if user.is_adminkvm:
            return redirect('superadmin:home')
        return func(request, *args, **kwargs)
    return wrapper


def admin_only(func):
    """
    Check tài khoản admin
    :param func:
    :return:
    """
    def wrapper(request, *args, **kwargs):
        user = request.user
        if not user.is_adminkvm:
            return redirect('client:home')
        return func(request, *args, **kwargs)
    return wrapper
