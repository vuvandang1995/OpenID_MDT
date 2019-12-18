FROM python:3 as app
EXPOSE 5000
WORKDIR /openid
ADD requirements.txt /openid/
RUN pip install -r /openid/requirements.txt
COPY openid /openid
EXPOSE 5000
CMD ["gunicorn", "--bind=0.0.0.0:5000", "-k", "gevent", "openid.wsgi:application"]

FROM nginx as webapp
WORKDIR /static
ADD openid/superadmin/static /static
EXPOSE 80