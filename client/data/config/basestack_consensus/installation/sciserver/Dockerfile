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

ARG USER_ID
ARG GROUP_ID
ARG ENVIRONMENT
RUN if [[ $ENVIRONMENT != "WIN" ]]; then\
        if [[ ! $(grep :${GROUP_ID}: /etc/group) ]]; then \
            addgroup --gid $GROUP_ID user; \
        else \
            if [[ ! $(grep 1000 /etc/group) ]]; then \
                addgroup --gid 1000 user;\
            fi\
        fi\
    fi
RUN if [[ $ENVIRONMENT != "WIN" ]]; then \
        useradd -o -m  -u $USER_ID -g $GROUP_ID  user;\
    else \
        useradd -o -m -g 1000 -u 1000 user;\
    fi 

# configure directory structure exactly as it is on SciServer for ease of transition

USER user
RUN mkdir -p /home/user/idies/workspace/covid19/code \
    && chown $USER_ID:$GROUP_ID /home/user/idies/workspace/covid19/code \
    && chmod g+s /home/user/idies/workspace/covid19/code

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

# install consensus pipeline repos
RUN git clone https://github.com/tmehoke/ncov \
    && git clone --recurse-submodules https://github.com/artic-network/artic-ncov2019 \
    && git clone https://github.com/cov-lineages/pangolin.git

# install conda environments
RUN conda env create -f ncov/environment.yml \
    && conda env create -f artic-ncov2019/environment.yml \
    && sed -i 's/  - python=3.6/  - python=3.7/' pangolin/environment.yml \
    && conda env create -f pangolin/environment.yml \
    && conda activate pangolin \
    && cd pangolin \
    && python setup.py install

WORKDIR /home/user/idies/workspace/covid19/code/ncov/pipeline_scripts
RUN git clone https://github.com/mkirsche/CoverageNormalization.git \
    && git clone https://github.com/mkirsche/VariantValidator.git

# copy rest of necessary environment over
RUN cp -r /home/user/idies/workspace/covid19/code/ncov/covid19 /home/user/idies/workspace/

# clone cov-lineages
WORKDIR /home/user/idies/workspace/covid19/ncov_reference
RUN git clone https://github.com/cov-lineages/lineages.git

#RUN find /home/user/idies/workspace/covid19/ -type f -print0 | xargs -0 dos2unix

# compile java libraries
ENV PATH="/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts:${PATH}"
ENV PATH="/home/user/idies/workspace/covid19/code/jdk-14/bin:${PATH}"
ENV PATH="/home/user/idies/workspace/covid19/code/ont-guppy-cpu/bin:${PATH}"

# copy 13-gene genome.json over into RAMPART directory (which has a 9-gene file by default)
RUN cp /home/user/idies/workspace/covid19/ncov_reference/genome.json /home/user/idies/workspace/covid19/code/artic-ncov2019/rampart/genome.json

#RUN chown -R $USER_ID:$GROUP_ID /home/user

# install TeX libraries
RUN wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh \
    && export PATH=/home/user/.TinyTeX/bin/x86_64-linux:$PATH \
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
