#  
#    - # **********************************************************************
#    - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
#    - #
#    - # All Rights Reserved.
#    - # For any other permission, please contact the Legal Office at JHU/APL.
#    - # **********************************************************************
#   
# Define directory variables
SHELL=/bin/bash
BASE_DIR := $(dir $(CURDIR)/$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST)))
ROOT_DIR := $(patsubst %/,%,$(BASE_DIR))
THIS_FILE := $(ROOT_DIR)/Makefile
THIS_DIR := $(notdir $(patsubst %/,%,$(ROOT_DIR)))
TEST_DATA := $(ROOT_DIR)/test-data
PYTHON_EXECUTABLE := $(shell which python)
CLIENT_DIR := $(ROOT_DIR)/client
DATA_DIR := ${CLIENT_DIR}/data
UID := $(shell id -u)
GID := $(shell id -g)
UNAME := $(shell uname -s)
ARCH := $(shell uname -m)
HOME := $(shell echo $${HOME})

CONDA_ACTIVATE=source $$(conda info --base)/etc/profile.d/conda.sh ; conda activate ; conda activate
WHOAMI := $(shell whoami)

#Indictate whete or not dependencies are present in the makefile as assigned variables
PYTHON := $(shell command -v python 2> /dev/null)
WGET := $(shell command -v wget 2> /dev/null)
CONDA := $(shell command -v conda 2> /dev/null)
DOCKER := $(shell command -v docker 2> /dev/null)
BREW := $(shell command -v brew 2> /dev/null)
ARTIC := $(shell command docker images -q artic:latest 2> /dev/null)



# Build entire app from scratch, including dev mode
build-win: variables install-modules clone build-app 
build-unix: variables install-modules clone build-app 

# Use pre-compiled binaries and install docker images from scratch (requires internet)
install-unix: variables build-docker-images-unix 
install-win: variables build-docker-images-win 

#Use pre-compile binaries and install docker images from pre-compressed .tar.gz files (requires internet for initial install)

load-unix: variables check-images-installed 
load-win: variables check-images-installed 
load-unix-fresh: rm-docker-local load-unix
load-win-fresh: rm-docker-local load-win

build-base-deps: install-deps source-miniconda create-basestack activate-basestack
test-source: source-miniconda create-basestack
install-deps: check-python check-wget check-docker check-conda


#Check if binaries/commands exist. IF not, install them

check-python:
	@echo "Checking if python is installed..."
ifndef PYTHON
	@echo "Please install python for your OS. Exiting"
	exit 1
endif
	@echo "\t...python is installed, continuing"

check-wget:
	@echo "Checking if wget installed..."
ifndef WGET
	$(MAKE) install-wget
endif
	@echo "\t...wget installed, continuing"



check-docker:
	@echo "Checking if docker is installed..."
ifndef DOCKER
	$(MAKE) install-docker
endif
	@echo "\t...docker installed, continuing"
check-conda:
	@echo "Checking if conda is installed..."
ifndef CONDA
	@if [ ! -d "${HOME}/miniconda3" ]; then\
		$(MAKE) install-miniconda;\
		exit 0;\
	else\
		echo "conda is not findable in your env but is available in ${HOME} directory (assuming it went through the default install process into your Home (${HOME}) directory)";\
		echo -e "\n\nPlease source your conda environment and rerun your installation option: 'source ${HOME}/miniconda3/etc/profile.d/conda.sh'";\
		echo -e "\n\n\n. Ignore the following files";\
		exit 1;\
	fi

endif
	@echo "\t...conda installed, continuing"

check-images-installed:
	@echo "Checking if docker is installed on your machine, installing if not."
	$(MAKE) check-docker
	@echo "Checking if the docker image (Artic) is already available to the user"
	$(MAKE) check-artic-installed

# https://drive.google.com/open?id=1M39vc0uTMsNJE3sS9X7zW_rCXUdyLk3j - location of artic.tar.gz dockerfile

check-artic-installed:
ifndef ARTIC
	@echo "Not defined: artic docker image, using local image to install."
	$(MAKE) download-load-docker-images
else
	@echo "Artic already defined. If you want to reinstall locally, please rm the image first and try again."
endif
	@echo "Artic (consensus and rampart) completed"

rm-docker-local:
	rm -rf 'client/data/dockerbuild/artic/images/artic.tar.gz'

download-load-docker-images:
	mkdir -p 'client/data/dockerbuild/artic/images'
ifeq (,$(wildcard 'client/data/dockerbuild/artic/images/artic.tar.gz'))
	@echo "Downloading docker images from gdrive"
	$(shell gdown  'https://drive.google.com/uc?id=1M39vc0uTMsNJE3sS9X7zW_rCXUdyLk3j' -O 'client/data/dockerbuild/artic/images/artic.tar.gz')	
endif	
	@echo "installing artic docker"
	$(shell docker load < 'client/data/dockerbuild/artic/images/artic.tar.gz') 
	@echo "installed artic docker"
#Install 3rd parety dependencies
install-brew:
	@echo "Checking if brew installed"
ifndef BREW
	@echo "Installing brew"
	curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install | /bin/bash
else
	echo "Brew already installed, continuing"
endif	
install-wget:
	@echo "installing wget"
	@if [ ${UNAME} = "Linux" ]; then\
		sudo apt-get install wget;\
	else\
		$(MAKE) install-brew;\
		brew install wget;\
	fi
install-docker:
# 		$(MAKE) install-brew;\
# 		brew install caskroom/cask/brew-cask;\
# 		brew cask install docker-toolbox;\
	@echo "installing docker"
	@if [ ${UNAME} = "Linux" ]; then\
		wget -O docker.sh https://get.docker.com && mv docker.sh /tmp/ ;\
		bash /tmp/docker.sh;\
		rm /tmp/docker.sh;\
		sudo usermod -aG docker ${WHOAMI};\
	else\
		echo "Please install Docker manually at: https://docs.docker.com/get-docker/";\
		exit 1;\
	fi 

install-miniconda:
	@echo "installing miniconda. This will error out if you already have miniconda3 installed in ${HOME}"

	@if [ ${UNAME} = "Linux" ]; then\
		echo "Installing Conda on Linux";\
		wget "https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh";\
		bash Miniconda3-latest-Linux-x86_64.sh -b -p "${HOME}/miniconda3";\
		rm Miniconda3-latest-Linux-x86_64.sh ;\
		source ${HOME}/.bashrc && which conda;\
	else\
		echo "Installing Conda on Mac";\
		wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh -O ${HOME}/miniconda.sh;\
		bash ${HOME}/miniconda.sh -b -p ${HOME}/miniconda;\
		source ${HOME}/.bashrc && which conda;\
	fi 

#Not used at the moment due to makefile limitations
source-miniconda:
ifndef CONDA
	@if [ ! -d "${HOME}/miniconda3" ]; then\
	    echo "Conda not currently available in your environment and not present in ${HOME}. Exiting. Please follow the necessary steps to install anaconda/miniconda on your own environment or rerun this installation process";\
		exit 1;\
	else\
		echo "conda is not findable in your env but is available in ${HOME} directory (assuming it went through the default install process into your Home (${HOME}) directory)";\
		echo -e "\n\nPlease source your conda environment and rerun your installation option: 'source ${HOME}/miniconda3/etc/profile.d/conda.sh'";\
		echo -e "\n\n\n. Ignore the following files";\
		exit 1;\
	fi
else
	echo "Conda already available in your env, skipping..." 	
endif
create-basestack:
	bash -c "conda env create -f ${ROOT_DIR}/environment.yml"; exit 0;
activate-basestack:
	@echo "Now, be sure to activate basestack with 'conda activate basestack'"
	($(CONDA_ACTIVATE) basestack ; which python )
#Run the development process for basestack	
dev: 
	@echo "running development app"
	@if [[ ${UNAME} = "Linux" || ${UNAME} = "Darwin" ]]; then\
		cd ${ROOT_DIR}/client && ($(CONDA_ACTIVATE) basestack ; npm run dev );\
	else\
		cd ${ROOT_DIR}/client && npm run dev ;\
	fi 
#Build images depending on the HOST OS
build-docker-images-win:
	@echo "building docker images for windows env"
	@if [[ ${UNAME} = "Linux" || ${UNAME} = "Darwin" ]]; then\
		cd ${ROOT_DIR}/client/data/dockerbuild && ($(CONDA_ACTIVATE) basestack ; docker-compose  build --build-arg ENVIRONMENT="WIN" );\
	else\
		cd ${ROOT_DIR}/client/data/dockerbuild/ && docker-compose  build --build-arg ENVIRONMENT="WIN";\
	fi  
build-docker-images-unix:
	@echo "building docker images for unix env"
	@if [[ ${UNAME} = "Linux" || ${UNAME} = "Darwin" ]]; then\
		cd ${ROOT_DIR}/client/data/dockerbuild/ && \
		($(CONDA_ACTIVATE) basestack ; \
			docker-compose build --build-arg USER_ID=${UID} --build-arg GROUP_ID=${GID} --build-arg ENVIRONMENT="UNIX");\
	else\
		"Can't build unix package from this OS: ${UNAME}";\
	fi 




#Build the app (both production and dev)
install-modules: 
	@echo "Installing Dependencies in: "${ROOT_DIR}/client/node_modules
	@if [[ ${UNAME} = "Linux" || ${UNAME} = "Darwin" ]]; then\
			cd ${ROOT_DIR}/client && ($(CONDA_ACTIVATE) basestack ; npm install );\
	else\
			cd ${ROOT_DIR}/client && npm install;\
	fi 
#Just build the production 
build-app:
	@echo "\nBuilding app..."
	@if [[ ${UNAME} = "Linux" || ${UNAME} = "Darwin" ]]; then\
			cd ${ROOT_DIR}/client && ($(CONDA_ACTIVATE) basestack ; npm run build );\
	else\
			cd ${ROOT_DIR}/client && npm run build;\
	fi ;\
	echo "Executable file is located in "${ROOT_DIR}/client/build/
#Clone test-data and artic primer schemes and protocols


clone: 
	@echo "Cloning repos from artic network"
	rm -rf ${DATA_DIR}/protocols/artic-ncov2019 ${DATA_DIR}/protocols/rampart-iva
	mkdir -p ${DATA_DIR}/protocols
	mkdir -p ${DATA_DIR}/primer_schemes
	$(MAKE) clone-shell
	cp -fr ${DATA_DIR}/protocols/artic-ncov2019/primer-schemes/* ${DATA_DIR}/primer_schemes/
	mv ${DATA_DIR}/primer_schemes/SARS-CoV-2 ${DATA_DIR}/primer_schemes/nCoV-2019
	cp -fr ${DATA_DIR}/protocols/artic-ncov2019/rampart ${DATA_DIR}/protocols/rampart-ncov2019
	cp -fr ${DATA_DIR}/protocols/rampart-iva/protocol ${DATA_DIR}/protocols/rampart-iva19
	rm -rf ${DATA_DIR}/protocols/artic-ncov2019
	rm -rf ${DATA_DIR}/protocols/rampart-iva


clone-shell:
# 	There is an issue with syntax for makefile and using shell git clone. consider refactor in the future
ifneq ($(UNAME), Linux)
ifneq ($(UNAME), Darwin)
	$(shell git clone --recurse-submodules https://github.com/artic-network/artic-ncov2019.git ${DATA_DIR}/protocols/artic-ncov2019)
	$(shell git clone https://github.com/artic-network/rampart-iva.git ${DATA_DIR}/protocols/rampart-iva)
else
	($(CONDA_ACTIVATE) basestack ; git clone --recurse-submodules https://github.com/artic-network/artic-ncov2019.git ${DATA_DIR}/protocols/artic-ncov2019)
	($(CONDA_ACTIVATE) basestack ; git clone https://github.com/artic-network/rampart-iva.git ${DATA_DIR}/protocols/rampart-iva)
endif
else
	($(CONDA_ACTIVATE) basestack ; git clone --recurse-submodules https://github.com/artic-network/artic-ncov2019.git ${DATA_DIR}/protocols/artic-ncov2019)
	($(CONDA_ACTIVATE) basestack ; git clone https://github.com/artic-network/rampart-iva.git ${DATA_DIR}/protocols/rampart-iva)
endif
	

#Print out variables in use


variables:
	@echo "-------------------------------------"
	@echo "BASE_DIR = ${BASE_DIR}"
	@echo "ROOT_DIR = ${ROOT_DIR}"
	@echo "THIS_FILE = ${THIS_FILE}"
	@echo "THIS_DIR = ${THIS_DIR}"
	@echo "TEST_DIR = ${TEST_DATA}"
	@echo "UID = ${UID}"
	@echo "GID = ${GID}"
	@echo "UNAME = ${UNAME}"
	@echo "architecture = ${ARCH}"
	@echo "home = ${HOME}"
	@echo "whoami = ${WHOAMI}"
	@echo "data dir = ${DATA_DIR}"
	@echo "client dir = ${CLIENT_DIR}"
	@echo "conda activate = ${CONDA_ACTIVATE}"
	@echo "python = ${PYTHON_EXECUTABLE}"
	@echo "artic = ${ARTIC}"
	@echo "-------------------------------------"

