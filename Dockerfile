FROM python:3.6

EXPOSE 5000

WORKDIR /openid

ADD requirements.txt /openid/

RUN pip install -r /openid/requirements.txt

ADD . /openid/

CMD ["gunicorn", "-b", "0.0.0.0:5000", "-k", "gevent", "openid.wsgi:application"]
