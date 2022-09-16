FROM  docker:dind-rootless
WORKDIR /opt
USER root
#Install gcc for pip installation processes
RUN  apk add --no-cache --virtual .build-deps gcc musl-dev curl bash  linux-headers
# Install python/pip

RUN apk add --no-cache \
    python3 python3-dev libxml2-dev  docker-compose git bash nodejs g++ \
    npm libc-dev go linux-headers libressl-dev libuuid libseccomp-dev make 
    # util-linux-dev glib-dev
    
RUN ln -sf python3 /usr/bin/python



RUN python3 -m ensurepip


RUN pip3 install --no-cache --upgrade pip 
RUN pip3 install --upgrade  setuptools==57.4.0 cython wheel 
RUN pip3 install snakemake 
ENV PATH="/usr/local/singularity/bin:${PATH}"

# RUN curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o /opt/miniconda.sh \
#     bash /opt/miniconda.sh -b -p /opt/miniconda3 && \
#     rm /opt/miniconda.sh
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


# RUN  pip install -r requirements.txt && cwltool --version


RUN curl -s https://get.nextflow.io | bash
RUN pip install  nf-core
RUN mv nextflow /usr/local/bin/
RUN dockstore --version
RUN apk add --no-cache parallel ncurses && \
    mkdir -p ~/.parallel && touch ~/.parallel/will-cite
RUN echo "done"
#Install snakemake and docker-compose
#Remove unneeded files

# ARG SINGULARITY_COMMITISH="master"
# RUN git clone --recurse-submodules https://github.com/sylabs/singularity.git \
#     && cd singularity && apk add --no-cache  glib-dev \ 
#     && git checkout "$SINGULARITY_COMMITISH" \
#     && ./mconfig -p /usr/local/singularity \
#     && cd builddir 
#     && make \
#     && make install


ARG SINGULARITY_COMMITISH="master"
ARG VERSION="3.9.9"
RUN wget https://github.com/sylabs/singularity/releases/download/v$VERSION/singularity-ce-$VERSION.tar.gz && \
    tar -xzf singularity-ce-$VERSION.tar.gz 

WORKDIR /opt/singularity-ce-3.9.9

RUN ls && ./mconfig && \
    make -C builddir && \
    make -C builddir install


RUN mkdir -p /data/ 
WORKDIR /opt/app