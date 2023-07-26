#!/bin/bash

# # Update packages and install dependencies
sudo apt-get update -y && \
sudo apt-get install -y build-essential libssl-dev uuid-dev libgpgme11-dev squashfs-tools libseccomp-dev wget pkg-config git cryptsetup-bin

# # Set Go Environment Variables
export VERSION=1.15 OS=linux ARCH=amd64 

# # # Download and install Go
wget "https://dl.google.com/go/go$VERSION.$OS-$ARCH.tar.gz" -O $HOME/go.tar.gz && \
tar -C $HOME -xzf "$HOME/go.tar.gz" 

# # # Remove Go installer file
rm "go$VERSION.$OS-$ARCH.tar.gz"

# # # Add Go path to bashrc 
if ! grep -q 'export GOPATH=${HOME}/go' ~/.bashrc ; then
    echo 'export GOPATH=${HOME}/go' >> ~/.bashrc
fi

if ! grep -q 'export PATH=$HOME/go/bin:${PATH}:${GOPATH}/bin' ~/.bashrc ; then
    echo 'export PATH=$HOME/go/bin:${PATH}:${GOPATH}/bin' >> ~/.bashrc
fi

export PATH=$HOME/go/bin:${PATH}:${GOPATH}/bin
export GOPATH=${HOME}/go

# Install Singularity
export VERSION="3.8.3" # adjust this as necessary

# Clone Singularity repo
cd $GOPATH && \
mkdir -p $HOME/singularity/src/github.com/sylabs && \
cd $HOME/singularity/src/github.com/sylabs && \
git clone https://github.com/sylabs/singularity.git && \
cd singularity

# Checkout to a specific version
git checkout "v${VERSION}"
echo $GOPATH
# Build Singularity
cd $HOME/singularity/src/github.com/sylabs/singularity && \
./mconfig && \
cd ./builddir && \
make && \
sudo make install

echo 'Singularity installation completed!'
