FROM continuumio/miniconda3
# continuumio/miniconda3 is FROM debian:latest

# Make RUN commands use `bash --login` (always source ~/.bashrc on each RUN)
SHELL ["/bin/bash", "--login", "-c"]

# install apt depedencies and update conda
RUN apt-get update && apt-get install git -y \
    && apt-get install -y apt-transport-https ca-certificates wget unzip bzip2 libfontconfig1 \
    && update-ca-certificates \
    && apt-get -qq -y remove curl \
    && apt-get -qq -y autoremove \
    && apt-get autoclean \
    && apt-get install -y dos2unix \
    && rm -rf /var/lib/apt/lists/* /var/log/dpkg.log 

# link global conda to expected sciserver location
#RUN ln -s /opt/conda/ /home/idies/workspace/covid19/miniconda3

ENV PATH /opt/conda/bin:$PATH

RUN conda install -y python=3 \
    && conda update -y conda \
    && conda clean --all --yes

# clone ARTIC repo
RUN git clone --recurse-submodules https://github.com/artic-network/artic-ncov2019 \
    && conda env create -f artic-ncov2019/environment.yml


# install pangolin lineages (this is set up separate from the other repos, but will be fixed)
# clone pangolin
RUN git clone https://github.com/cov-lineages/pangolin.git \
    && sed -i 's/  - python=3.6/  - python=3.7/' pangolin/environment.yml \
    && conda env create -f pangolin/environment.yml \
    && conda activate pangolin \
    && cd pangolin \
    && python setup.py install

ARG USER_ID
ARG GROUP_ID
ARG ENVIRONMENT

RUN if [[ $ENVIRONMENT != "WIN" ]]; then addgroup --gid $GROUP_ID user; else addgroup --gid 1000 user; fi 
RUN if [[ $ENVIRONMENT != "WIN" ]]; then adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID user; else adduser --disabled-password --gecos '' --uid 1000 --gid 1000 user; fi 

# configure directory structure exactly as it is on SciServer for ease of transition

# install openjdk
WORKDIR /home/user/idies/workspace/covid19/code
RUN wget https://download.java.net/java/GA/jdk14/076bab302c7b4508975440c56f6cc26a/36/GPL/openjdk-14_linux-x64_bin.tar.gz \
    && tar -xzf openjdk-14_linux-x64_bin.tar.gz \
    && rm openjdk-14_linux-x64_bin.tar.gz
# install samtools 1.10
RUN wget https://github.com/samtools/samtools/releases/download/1.10/samtools-1.10.tar.bz2 \
    && tar -xjf samtools-1.10.tar.bz2 \
    && rm samtools-1.10.tar.bz2

# clone VCF IGV repo and install local IGV
RUN git clone https://github.com/mkirsche/vcfigv \
    && wget https://data.broadinstitute.org/igv/projects/downloads/2.8/IGV_2.8.10.zip -P vcfigv \
    && unzip -d vcfigv vcfigv/IGV_2.8.10.zip \
    && rm vcfigv/IGV_2.8.10.zip

# install ONT guppy tools
RUN wget --no-check-certificate https://americas.oxfordnanoportal.com/software/analysis/ont-guppy-cpu_3.6.1_linux64.tar.gz \
    && tar -xzf ont-guppy-cpu_3.6.1_linux64.tar.gz \
    && rm ont-guppy-cpu_3.6.1_linux64.tar.gz


# clone cov-lineages
WORKDIR /home/user/idies/workspace/covid19/ncov_reference
RUN git clone https://github.com/cov-lineages/lineages.git

# ultimately grab this env from a standalone git repo
# COPY from our own repo for now
#RUN git clone --recurse-submodules https://github.com/timplab/ncov \
#    && conda env create -f ncov/environment.yml
WORKDIR /home/user/idies/workspace/covid19/code/ncov
COPY --chown=$USER_ID:$GROUP_ID ./covid19/code/ncov/environment.yml /home/user/idies/workspace/covid19/code/ncov/environment.yml

RUN conda env create -f /home/user/idies/workspace/covid19/code/ncov/environment.yml

WORKDIR /home/user/idies/workspace/covid19/code/ncov/pipeline_scripts
RUN git clone https://github.com/mkirsche/CoverageNormalization.git \
    && git clone https://github.com/mkirsche/VariantValidator.git

# clone ARTIC repo
WORKDIR /home/user/idies/workspace/covid19/code
RUN git clone --recurse-submodules http://github.com/artic-network/artic-ncov2019 


# COPY rest of necessary environment over

COPY --chown=$USER_ID:$GROUP_ID ./covid19/ /home/user/idies/workspace/covid19/

RUN find /home/user/idies/workspace/covid19/ -type f -print0 | xargs -0 dos2unix

# compile java libraries
ENV PATH="/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts:${PATH}"
ENV PATH="/home/user/idies/workspace/covid19/code/jdk-14/bin:${PATH}"
ENV PATH="/home/user/idies/workspace/covid19/code/ont-guppy-cpu/bin:${PATH}"

# copy 13-gene genome.json over into RAMPART directory (which has a 9-gene file by default)
RUN cp /home/user/idies/workspace/covid19/ncov_reference/genome.json /home/user/idies/workspace/covid19/code/artic-ncov2019/rampart/genome.json


# install TeX libraries
RUN wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh 
RUN export PATH=/home/user/.TinyTeX/bin/x86_64-linux:$PATH \
    && tlmgr path add \
    && tlmgr install mnsymbol \
    && tlmgr install multirow \
    && tlmgr install wrapfig \
    && tlmgr install colortbl \
    && tlmgr install pdflscape \
    && tlmgr install tabu \
    && tlmgr install threeparttable \
    && tlmgr install threeparttablex \
    && tlmgr install environ \
    && tlmgr install ulem \
    && tlmgr install makecell 

# set up final environment and default working directory
RUN cat /home/user/idies/workspace/covid19/bashrc >> ~/.bashrc
RUN chmod -R 755 /home/user/idies/workspace/covid19/code/ncov/pipeline_scripts/
WORKDIR /home/user/idies/workspace/covid19
USER user

