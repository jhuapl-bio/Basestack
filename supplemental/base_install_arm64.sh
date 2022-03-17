#!/bin/bash

mkdir $HOME/bin

echo "export PATH=\"$HOME/bin:\$PATH\"" >> $HOME/.bashrc

sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install curl python3-pip libffi-dev python-openssl libssl-dev zlib1g-dev gcc g++ make -y
curl -sSL https://get.docker.com/ | sh
#sudo pip3 install docker-compose
#sudo docker-compose --version



## Install MinKNOW
cd $HOME/Downloads



#Install grpc dev dependency in case it is not available on the system
sudo apt-get install libgrpc-dev

wget -O- https://mirror.oxfordnanoportal.com/apt/ont-repo.pub | sudo apt-key add -
# echo "deb http://mirror.oxfordnanoportal.com/apt xenial-stable non-free" | sudo tee /etc/apt/sources.list.d/nanoporetech.sources.list
# sudo apt-get update
# #sudo apt-get install -y ont-kingfisher-ui-promethion minion-nc
# sudo apt-get install minknow-core-minit-offline ont-bream4-minit ont-configuration-customer-minit ont-kingfisher-ui-minit ont-remote-support ont-system-identification


# wget -O- https://mirror.oxfordnanoportal.com/apt/ont-repo.pub | sudo apt-key add -
echo "deb http://mirror.oxfordnanoportal.com/apt $(lsb_release -c | awk '{print $2}')-stable non-free" | sudo tee /etc/apt/sources.list.d/nanoporetech.sources.list

wget -O- https://mirror.oxfordnanoportal.com/apt/ont-repo.pub | sudo apt-key add -
sudo apt update
sudo apt install ont-minit-release
# sudo apt-get install -y minion-nc



## Install CUDA

wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/sbsa/cuda-ubuntu1804.pin
sudo mv cuda-ubuntu1804.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/11.6.1/local_installers/cuda-repo-ubuntu1804-11-6-local_11.6.1-510.47.03-1_arm64.deb
sudo dpkg -i cuda-repo-ubuntu1804-11-6-local_11.6.1-510.47.03-1_arm64.deb
sudo apt-key add /var/cuda-repo-ubuntu1804-11-6-local/7fa2af80.pub
sudo apt-get update
sudo apt-get -y install cuda -f

## Get Guppy Basecaller

wget https://mirror.oxfordnanoportal.com/software/analysis/ont-guppy_5.1.13_linuxaarch64_cuda10.tar.gz 
tar -xvzf ont-guppy_5.1.13_linuxaarch64_cuda10.tar.gz
find ont-guppy/bin/*  | while read line; do ln -fs $PWD/$line $HOME/bin/$(basename $line); done;

## Install 