FROM  debian:stretch-slim
#Aws cli requires glibc which isn't available by default in alpine. Pull a specific version for usage
WORKDIR /src/



RUN apt-get -y update
RUN apt-get install -y wget curl unzip groff dos2unix \
	&& curl -sL https://deb.nodesource.com/setup_10.x | bash \
	&& apt-get install -y nodejs \
	&& apt-get update \
	&& npm install express

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip  awscliv2.zip && \
    ./aws/install  > /dev/null 2>&1
ARG aws_key
COPY $aws_key /src/aws_key.csv    

RUN cat /src/aws_key.csv
RUN aws configure import --csv file:///src/aws_key.csv  
RUN echo "Downloading All Tutorial Videos from Amazon AWS S3 bucket, this can take some time..."
RUN echo "Version 1.0"
RUN export AWS_DEFAULT_PROFILE=NIH-Workshop && aws s3 cp --no-progress s3://workshop-nih-apl/tutorials.tar.gz tutorials.tar.gz 
RUN tar -xvzf tutorials.tar.gz


COPY express.js /src/
RUN ls tutorials/mp4
RUN find /src/*csv -type f -print0 | xargs -0 dos2unix

ENTRYPOINT ["node", "express.js"]
