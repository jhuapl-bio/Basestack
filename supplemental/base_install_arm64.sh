#!/bin/bash

source_path=$(dirname $0)


install_bin()
{  
mkdir $HOME/bin
echo "export PATH=\"$HOME/bin:\$PATH\"" >> $HOME/.bashrc
}


get_miniconda3(){
    echo "Get miniconda  "
    if [[ $(uname -m) == 'aarch64' ]] ||  [[ $(uname -m) == 'armhf' ]]; then
        wget https://repo.anaconda.com/miniconda/Miniconda3-py37_4.9.2-Linux-aarch64.sh $HOME/Downloads/Miniconda3-py37_4.9.2-Linux-aarch64.sh; 
        bash $HOME/Downloads/Miniconda3-py37_4.9.2-Linux-aarch64.sh -b -p $HOME/miniconda
        if   grep -q "source \"$HOME/miniconda/etc/profile.d/conda.sh\"" "$HOME/.bashrc"; then
            echo "Source line already found for miniconda in your $HOME/.bashrc, skipping"
        else 
            echo "source \"$HOME/miniconda/etc/profile.d/conda.sh\"" >> $HOME/.bashrc
        fi 
    else
        echo "skipping for non arm builds"
    fi 
}

install_docker()
{  


if hash docker 2>/dev/null; then
    read -p "Docker Already exists on this system. Install anyway?: ( y / n)? " answer
    case ${answer:0:1} in
        y|Y )
            curl -sSL https://get.docker.com/ | sh
            sudo apt-get update -y
            sudo apt-get upgrade -y
            sudo apt-get install curl python3-pip libffi-dev python-openssl libssl-dev zlib1g-dev gcc g++ make -y
        ;;
        n|N )
            echo "skipping Install setup"
        ;;
        * )
            echo "skipping Install setup"
        ;;
    esac
else
    sudo apt-get update -y
    sudo apt-get upgrade -y
    sudo apt-get install curl python3-pip libffi-dev python-openssl libssl-dev zlib1g-dev gcc g++ make -y
    curl -sSL https://get.docker.com/ | sh 
fi

## Set up Docker permissions post-installation
sudo groupadd docker

sudo apt install -y jq
    sudo usermod -aG docker $USER
    if   grep -q "$USER:$(id -u):1" "/etc/subgid"; then
        echo "found correct mapping in /etc/subgid, skipping..."
    else
        echo "not found subgid mapping, appending...";
        sudo sed -i "1s/^/$USER:$(id -u):1\n/" /etc/subgid
    fi

    if   grep -q "$USER:$(id -u):1" "/etc/subuid"; then
        echo "found correct mapping in /etc/subuid, skipping...";
    else
        echo "not found subuid mapping, appending...";
        sudo sed -i "1s/^/$USER:$(id -u):1\n/" /etc/subuid
    fi


    if [[ -s "/etc/docker/daemon.json" ]]; then
        cat "/etc/docker/daemon.json" | jq --arg USERNS $USER '."userns-remap" = $USERNS' > /tmp/daemon.json
        sudo mv /tmp/daemon.json /etc/docker/daemon.json
    else
        echo "{\"userns-remap\": \"$USER\"}"  | sudo tee -a /etc/docker/daemon.json
    fi


echo "Pulling docker image for mytax on arm, you may need to reboot if you get permission errors at this point"

docker pull jhuaplbio/basestack_mytax:v1.1.2
docker image tag jhuaplbio/basestack_mytax:v1.1.2 jhuaplbio/basestack_mytax:latest

echo "You should now be able to use Mytax within Basestack!"

}

install_minknow(){
    ## Install MinKNOW
    # cd $HOME/Downloads  
    sudo echo "Installing minknow"
    if [[ $(uname -m) == 'aarch64' ]] || [[ $(uname -m) == 'armhf' ]]; then     
        # wget -O- https://mirror.oxfordnanoportal.com/apt/ont-repo.pub | sudo apt-key add -
        
        # sudo apt install -y python-pip   
        # wget https://raw.githubusercontent.com/sirselim/jetson_nanopore_sequencing/main/setup-guide-mk1c.txt -O $HOME/Desktop/setup-guide-mk1c.txt
        # bash $HOME/Desktop/setup-guide-mk1c.txt
        sudo /opt/ont/minknow/bin/config_editor --conf application --filename /opt/ont/minknow/conf/app_conf --set guppy.connection.use_tcp=1
        read -p "CPU guppyd service or GPU (c/g)? " answer
        case ${answer:0:1} in
            G|g )
                sudo cp $source_path/guppyd.gpu.service /lib/systemd/system/guppyd.service ;
                sudo systemctl daemon-reload; sudo service guppyd restart; 
            ;;
            c|C )
                sudo cp $source_path/guppyd.cpu.service /lib/systemd/system/guppyd.service ;
                sudo systemctl daemon-reload; sudo service guppyd restart; 
            ;;
            * )
                echo "skipping guppy service setup"
            ;;
        esac
        
        sudo service minknow restart
        ## Minit installation - deprecated
        # echo "deb [trusted=yes] http://mirror.oxfordnanoportal.com/apt xenial-stable-minit non-free" | sudo tee /etc/apt/sources.list.d/nanoporetech.sources.list
        # sudo apt-get update 
        # sudo apt install -y minknow-core-minit-offline ont-bream4-minit ont-kingfisher-ui-minit ont-remote-support ont-system-identification ont-configuration-customer-minit
        # sudo apt install minknow-core-minion-1c-offline ont-bream4-mk1c \
        #     ont-configuration-customer-mk1c ont-kingfisher-ui-mk1c \
        #     ont-vbz-hdf-plugin ont-minion1c-fpga

    else 
        wget -O- https://mirror.oxfordnanoportal.com/apt/ont-repo.pub | sudo apt-key add -
        echo "deb http://mirror.oxfordnanoportal.com/apt $(lsb_release -c | awk '{print $2}')-stable non-free" | sudo tee /etc/apt/sources.list.d/nanoporetech.sources.list
        sudo apt-get -y update
        sudo apt-get install -y minion-nc
    fi 
    sudo /opt/ont/minknow/bin/config_editor --filename /opt/ont/minknow/conf/sys_conf --conf system --set on_acquisition_ping_failure=ignore
    sudo service minknow restart
}


install_CUDA_11_6() 
{
## Install CUDA
if [[ $(uname -m) == 'aarch64' ]] ||  [[ $(uname -m) == 'armhf' ]]; then

    echo "Under development for CUDA 11. However, guppy on ARM64 still uses cuda 10"
cat <<EOF    
    # wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/sbsa/cuda-ubuntu1804.pin
    # sudo mv cuda-ubuntu1804.pin /etc/apt/preferences.d/cuda-repository-pin-600
    # wget https://developer.download.nvidia.com/compute/cuda/11.6.1/local_installers/cuda-repo-ubuntu1804-11-6-local_11.6.1-510.47.03-1_arm64.deb
    # sudo dpkg -i cuda-repo-ubuntu1804-11-6-local_11.6.1-510.47.03-1_arm64.deb
    # sudo apt-key add /var/cuda-repo-ubuntu1804-11-6-local/7fa2af80.pub
    # sudo apt-get update
    # sudo apt-get -y install cuda -f


    Try this link https://dev.to/ajeetraina/install-cuda-on-jetson-nano-2b06


    sudo apt install ont-kingfisher-ui-minion


EOF
else 
    wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-ubuntu2004.pin
    sudo mv cuda-ubuntu2004.pin /etc/apt/preferences.d/cuda-repository-pin-600
    wget https://developer.download.nvidia.com/compute/cuda/11.6.1/local_installers/cuda-repo-ubuntu2004-11-6-local_11.6.1-510.47.03-1_amd64.deb
    sudo dpkg -i cuda-repo-ubuntu2004-11-6-local_11.6.1-510.47.03-1_amd64.deb
    sudo apt-key add /var/cuda-repo-ubuntu2004-11-6-local/7fa2af80.pub
    sudo apt-get update
    sudo apt-get -y install cuda
fi 

}

install_GUPPY() 
{
## Install CUDA
if [[ $(uname -m) == 'aarch64' ]] ||  [[ $(uname -m) == 'armhf' ]]; then
    ## Get Guppy Basecaller
    wget https://mirror.oxfordnanoportal.com/software/analysis/ont-guppy_5.1.13_linuxaarch64_cuda10.tar.gz 
    tar -xvzf ont-guppy_5.1.13_linuxaarch64_cuda10.tar.gz
    find ont-guppy/bin/*  | while read line; do ln -fs $PWD/$line $HOME/bin/$(basename $line); done;

else 
    wget https://mirror.oxfordnanoportal.com/software/analysis/ont-guppy_5.1.15_linux64.tar.gz
    tar -xvzf ont-guppy_5.1.15_linux64.tar.gz
    find ont-guppy/bin/*  | while read line; do ln -fs $PWD/$line $HOME/bin/$(basename $line); done;
fi 

}

install_BASESTACK(){

if [[ $(uname -m) == 'aarch64' ]] ||  [[ $(uname -m) == 'armhf' ]]; then
    ## Get the ARM64 build of Basestack
    wget https://github.com/jhuapl-bio/Basestack/releases/download/arm64/Basestack.arm64.AppImage && chmod +x Basestack.*AppImage
else 
    wget https://github.com/jhuapl-bio/Basestack/releases/latest/download/Basestack.x86_64.AppImage && chmod +x Basestack.*AppImage
fi 
mv Basestack.*AppImage $HOME/DESKTOP/

}

get_test_data(){

source $HOME/miniconda/etc/profile.d/conda.sh ; conda activate;  pip install gdown;  gdown 1zrgwheJxhMTvd7zu0fuRhVYYM0aGY5XS -O $HOME/Downloads/test-data.zip
unzip $HOME/Downloads/test-data.zip
if [[ -d "/data/minknow/" ]]; then
    sudo cp -r ./test-data2 "/data/minknow/"
    sudo chmod -R 777 '/data/minknow/test-data2'
    sudo chown -R minit:minit '/data/minknow/test-data2'
fi
if [[ -d "/var/lib/minknow/data" ]]; then
    sudo cp -r ./test-data2 "/var/lib/minknow/data/"
    sudo chmod -R 777 "/var/lib/minknow/data/test-data2"
    sudo chown -R minknow:minknow "/var/lib/minknow/data/test-data2"
fi





}

read -p "Setup your $HOME/bin path in \$PATH (y/n)? " answer
case ${answer:0:1} in
    y|Y )
        # mkdir $HOME/bin
        # echo "export PATH=\"$HOME/bin:\$PATH\"" >> $HOME/.bashrc
        install_bin
    ;;
    * )
        echo "skipping $HOME/bin setup"
    ;;
esac

read -p "Setup your miniconda in \$HOME/miniconda (y/n)? " answer
case ${answer:0:1} in
    y|Y )
        get_miniconda3
    ;;
    * )
        echo "skipping $HOME/miniconda setup"
    ;;
esac

read -p "Setup docker for linux (arm64 or amd64 is supported) (y/n)? " answer
case ${answer:0:1} in
    y|Y )
        install_docker
    ;;
    * )
        echo "skipping Docker setup"
    ;;
esac

read -p "Setup minknow UI (CPU basecalling only) ( y / n )? " answer
case ${answer:0:1} in
    y|Y )
        install_minknow 
    ;;
    * )
        echo "skipping MinKNOW setup"
    ;;
esac

read -p "Setup CUDA: r (arm64) / d (amd64) / n)? This should already be installed on your device if you're using a Jetson flashed with Jetpack" answer
case ${answer:0:1} in
    y|Y )
        install_CUDA_11_6 
    ;;
    * )
        echo "skipping MinKNOW setup"
    ;;
esac

read -p "Setup GUPPY for the user: ( y / n )? " answer
case ${answer:0:1} in
    Y|y )
        install_GUPPY "arm64"
    ;;
    * )
        echo "skipping Guppy setup"
    ;;
esac

read -p "Setup Basestack for the user: ( y / n )? " answer
case ${answer:0:1} in
    y|Y )
        install_BASESTACK 
    ;;
    * )
        echo "skipping basestack setup"
    ;;
esac



read -p "Get test data? Output to $HOME/Downloads/test-data2: ( y / n )? " answer
case ${answer:0:1} in
    y|Y )
        get_test_data 
    ;;
    * )
        echo "skipping test-data download"
    ;;
esac

echo "Get arm64 Visual studio code from: https://code.visualstudio.com/docs/?dv=linuxarmhf_deb"




#Install grpc dev dependency in case it is not available on the system
# sudo apt-get install -y libgrpc-dev

# echo "Minknow installation is a work in progress with the update to ubuntu 18 for jetson or xavier devices"

## Option 1. Fails
# wget -O- https://mirror.oxfordnanoportal.com/apt/ont-repo.pub | sudo apt-key add -
# echo "deb http://mirror.oxfordnanoportal.com/apt $(lsb_release -c | awk '{print $2}')-stable non-free" | sudo tee /etc/apt/sources.list.d/nanoporetech.sources.list
# sudo apt update
# sudo apt install ont-minit-release
# sudo apt-get install -y minion-nc

## Option 2. Fails
# wget -O- https://mirror.oxfordnanoportal.com/apt/ont-repo.pub | sudo apt-key add -
# echo "deb http://mirror.oxfordnanoportal.com/apt xenial-stable non-free" | sudo tee /etc/apt/sources.list.d/nanoporetech.sources.list
# sudo apt-get update
# #sudo apt-get install -y ont-kingfisher-ui-promethion minion-nc
# sudo apt-get install minknow-core-minit-offline ont-bream4-minit ont-configuration-customer-minit ont-kingfisher-ui-minit ont-remote-support ont-system-identification







## Install 