FROM  docker:20.10.8-dind
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
RUN pip3 install --upgrade  setuptools==57.4.0 cython wheel 
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
RUN apk add libxslt-dev && cat requirements.txt
RUN  pip install -r requirements.txt && cwltool --version
RUN curl -s https://get.nextflow.io | bash
RUN pip install  nf-core
RUN mv nextflow /usr/local/bin/
RUN dockstore --version
RUN apk add --no-cache parallel ncurses && \
    mkdir -p ~/.parallel && touch ~/.parallel/will-cite
RUN echo "done"
# RUN echo 'alias curl="curl -k"' | tee -a  ~/.bashrc
# RUN mkdir -p  /etc/docker/ && echo '{"dns": ["8.8.4.4", "8.8.8.8"]} ' | tee /etc/docker/daemon.json
# RUN mkdir -p  /etc/docker/ && echo '{"dns": [ "172.17.0.9"]} ' | tee /etc/docker/daemon.json
#Install snakemake and docker-compose
#Remove unneeded files
RUN mkdir -p /data/ 
# RUN sed -i 's/--host="\$dockerSocket"/--host="\$dockerSocket" -b basestack-network /g' /usr/local/bin/dockerd-entrypoint.sh
WORKDIR /opt/app