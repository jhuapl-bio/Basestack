FROM r-base:4.1.3
WORKDIR /opt/src
RUN apt-get update -y && apt-get install -y make gawk  curl unzip  libncurses5-dev procps libncursesw5-dev
RUN wget https://wonder.cdc.gov/amd/flu/irma/flu-amd.zip \
    && unzip flu-amd.zip
RUN apt-get install -y libncurses5
SHELL ["/bin/bash", "--login", "-c"]
ENV PATH="/opt/src/flu-amd:${PATH}"
