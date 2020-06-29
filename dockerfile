FROM ubuntu:18.04

# MAINTANER Your Name "youremail@domain.tld"

RUN apt-get update -y && \
  apt-get install -y python-pip && \
  apt-get install -y python-dev

# We copy just the requirements.txt first to leverage Docker cache
COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r requirements.txt

COPY . /app

ENTRYPOINT [ "python" ]

CMD [ "start.py" ]