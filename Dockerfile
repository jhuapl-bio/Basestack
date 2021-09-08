FROM  docker:stable-dind
WORKDIR /opt
#Install gcc for pip installation processes
RUN apk add --no-cache --virtual .build-deps gcc musl-dev curl bash  linux-headers
# Install python/pip
RUN apk add --no-cache python3 python3-dev libxml2-dev  docker-compose git bash nodejs g++ npm libc-dev go linux-headers libressl-dev libuuid libseccomp-dev make util-linux-dev && ln -sf python3 /usr/bin/python

ARG SINGULARITY_COMMITISH="master"
RUN git clone https://github.com/sylabs/singularity.git \
    && cd singularity \
    && git checkout "$SINGULARITY_COMMITISH" \
    && ./mconfig -p /usr/local/singularity \
    && cd builddir \
    && make \
    && make install
RUN python3 -m ensurepip


RUN pip3 install --no-cache --upgrade pip 
RUN pip3 install --upgrade  setuptools cython wheel 
RUN pip3 install snakemake 
ENV PATH="/usr/local/singularity/bin:${PATH}"

# RUN curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o /opt/miniconda.sh 
    # bash /opt/miniconda.sh -b -p /opt/miniconda3 && \
    # rm /opt/miniconda.sh
RUN apk add openjdk11 
RUN mkdir -p ~/bin \ 
    && curl -L  -o /usr/local/dockstore https://github.com/dockstore/dockstore/releases/download/1.11.5/dockstore \
    && chmod +x /usr/local/dockstore
ENV PATH="/usr/local:${PATH}"
ENV DOCKSTORE_ROOT=1
RUN mkdir -p ~/.dockstore \
    && printf "token: dummy-token\nserver-url: https://dockstore.org/api\nDOCKSTORE_ROOT=1\n" | tee ~/.dockstore/config
RUN curl -o requirements.txt "https://dockstore.org/api/metadata/runner_dependencies?client_version=1.11.5&python_version=3" 
RUN apk add libxslt-dev &&  pip install -r requirements.txt && cwltool --version
#Install snakemake and docker-compose
#Remove unneeded files
WORKDIR /opt/app