#!/usr/bin/env python

# submit a shell command as a batch job.
# See https://github.com/sciserver/SciScript-Python/blob/Feature_Jobs/py3/SciServer/Jobs.py

from SciServer import Jobs,Authentication,Config
import sys
import json
import requests
import time
import re
import argparse

### Functions to submit the job

def pathForUserVolume(uv):
    return '{0}/{1}/{2}'.format(uv['rootVolumeName'],uv['owner'],uv['name'])

# the following code replaces similar function in SciServer.Jobs
# That verison does not yet support writing to a data volume
def submitShellCommandJob(shellCommand, dockerComputeDomain = None, dockerImageName = None, userVolumes = None,
dataVolumes = None, resultsFolderPath = "", jobAlias = ""):
    """
    Submits a shell command for execution (as an asynchronous job) inside a Docker compute domain.
    :param shellCommand: shell command (string) defined by the user.
    :param dockerComputeDomain: object (dictionary) that defines a Docker compute domain. A list of these kind of objects available to the user is returned by the function Jobs.getDockerComputeDomains().
    :param dockerImageName: name (string) of the Docker image for executing the notebook. E.g., dockerImageName="Python (astro)". An array of available Docker images is defined as the 'images' property in the dockerComputeDomain object.
    :param userVolumes: a list with the names of user volumes (with optional write permissions) that will be mounted to the dockerImage.
           E.g., userVolumes = [{'name':'persistent', 'needsWriteAccess':False},{'name':'scratch', , 'needsWriteAccess':True}]
           A list of available user volumes can be found as the 'userVolumes' property in the dockerComputeDomain object. If userVolumes=None, then all available user volumes are mounted, with 'needsWriteAccess' = True if the user has Write permissions on the volume.
    :param dataVolumes: a list with the names of data volumes that will be mounted to the docker Image.
           E.g., dataVolumes=[{"name":"SDSS_DAS"}, {"name":"Recount"}].
           A list of available data volumes can be found as the 'volumes' property in the dockerComputeDomain object. If dataVolumes=None, then all available data volumes are mounted.
    :param resultsFolderPath: full path to results folder (string) where the shell command is executed. E.g.: /home/user/idies/workspace/rootVolume/username/userVolume/jobsFolder. If not set, then a default folder will be set automatically.
    :param jobAlias: alias (string) of job, defined by the user.
    :return: the job ID (int)
    :raises: Throws an exception if the HTTP request to the Authentication URL returns an error. Throws an exception if the HTTP request to the JOBM API returns an error, or if the volumes defined by the user are not available in the Docker compute domain.
    :example: dockerComputeDomain = Jobs.getDockerComputeDomains()[0]; job = Jobs.submitShellCommandJob('pwd', dockerComputeDomain, 'Python (astro)', [{'name':'persistent'},{'name':'scratch', 'needsWriteAccess':True}],[{'name':'SDSS_DAS'}], 'myNewJob')
    .. seealso:: Jobs.submitNotebookJob, Jobs.getJobStatus, Jobs.getDockerComputeDomains, Jobs.cancelJob
    """

    token = Authentication.getToken()
    if token is not None and token != "":

        if Config.isSciServerComputeEnvironment():
            taskName = "Compute.SciScript-Python.Jobs.submitShellCommandJob"
        else:
            taskName = "SciScript-Python.Jobs.submitShellCommandJob"

        if dockerComputeDomain is None:
            dockerComputeDomains = getDockerComputeDomains();
            if dockerComputeDomains .__len__() > 0:
                dockerComputeDomain = dockerComputeDomains[0];
            else:
                raise Exception("There are no dockerComputeDomains available for the user.");
        if dockerImageName is None:
            images = dockerComputeDomain.get('images');
            if images.__len__() > 0:
                dockerImageName = images[0].get('name')
            else:
                raise Exception("dockerComputeDomain has no docker images available for the user.");

        uVols = [];
        for uVol in userVolumes:
            found = False;
            for vol in dockerComputeDomain.get('userVolumes'):
                if vol.get('name') == uVol.get('name'):
                    found = True;
                    if (uVol.get('needsWriteAccess')):
                        if uVol.get('needsWriteAccess') == True and 'write' in vol.get('allowedActions'):
                            uVols.append({'userVolumeId': vol.get('id'), 'needsWriteAccess': True});
                        else:
                            uVols.append({'userVolumeId': vol.get('id'), 'needsWriteAccess': False});
                    else:
                        if 'write' in vol.get('allowedActions'):
                            uVols.append({'userVolumeId': vol.get('id'), 'needsWriteAccess': True});
                        else:
                            uVols.append({'userVolumeId': vol.get('id'), 'needsWriteAccess': False});

            if not found:
                raise Exception("User volume '" + uVol.get('name') + "' not found within Compute domain")

        datVols = [];
        for dVol in dataVolumes:
            found = False;
            for vol in dockerComputeDomain.get('volumes'):
                name=dVol.get('name')
                if name == vol.get('name'):
                    found = True
                    if (vol.get('needsWriteAccess')):
                        print(vol.get('needsWriteAccess'))
                        print(vol.get('writable'))
                        if vol.get('needsWriteAccess') == True and vol.get('writable') == True:
                            datVols.append({'name': name, 'writable': True});
                        else:
                            datVols.append({'name': name, 'writable': False});
                    else:
                        if vol.get('writable'):
                            datVols.append({'name': name, 'writable': True});
                        else:
                            datVols.append({'name': name, 'writable': False});
                    found = True;

            if not found:
                raise Exception("Data volume '" + dVol.get('name') + "' not found within Compute domain")

        dockerComputeEndpoint = dockerComputeDomain.get('apiEndpoint');

        dockerJobModel = {
            "command": shellCommand,
            "submitterDID": jobAlias,
            "dockerComputeEndpoint": dockerComputeEndpoint,
            "dockerImageName": dockerImageName,
            "volumeContainers": datVols,
            "userVolumes": uVols,
            "resultsFolderURI": resultsFolderPath
        }
        data = json.dumps(dockerJobModel).encode()
        url = Config.RacmApiURL + "/jobm/rest/jobs/docker?TaskName="+taskName;
        headers = {'X-Auth-Token': token, "Content-Type": "application/json"}
        res = requests.post(url, data=data, headers=headers, stream=True)

        if res.status_code != 200:
            raise Exception("Error when submitting a job to the JOBM API.\nHttp Response from JOBM API returned status code " + str(res.status_code) + ":\n" + res.content.decode());
        else:
            return (json.loads(res.content.decode())).get('id')
    else:
        raise Exception("User token is not defined. First log into SciServer.")


# ### Sciserver User Config
def authenticate_user():
        try:
                token=Authentication.getToken()
                user=Authentication.getKeystoneUserWithToken(token)
                USERNAME=user.userName
        except requests.exceptions.ConnectionError as e:
                print("Connection Error: Authentication Token was not generated.")
                print("     Please log back in to SciServer and try again.")
                sys.exit(1)
        except Exception as e:
                if "Error when getting the keystone user with token" in str(e.args[0]):
                        print("Connection Error: Authentication failed.  User not signed in.")
                        print("     Please log back in to SciServer, reboot terminal, and try again.")
                else:
                        print("Unexpected error:", sys.exc_info()[0])
                        raise
                sys.exit(1)
        else:
                return(token, USERNAME)

# define the required job environment
def get_job_environment(token, USERNAME):
	DOMAIN='COVID-19 Jobs'  #hardcoded for now
	IMAGE='SciServer Essentials' #hardcoded for now

	# define lists of user and data volumes that should be mounted
	USERVOLUMES=['Storage/'+ USERNAME + '/persistent','Temporary/'+ USERNAME +'/scratch']
	DATAVOLUMES=['COVID-19']

	RESULTSFOLDERPATH = "/home/user/idies/workspace/Temporary/" + USERNAME + "/scratch/jobs"

	domains=Jobs.getDockerComputeDomains()
	domain=None
	image=None
	volumes=[]
	userVolumes=[]
	dataVolumes=[]
	for d in domains:
		if d['name'] == DOMAIN:
			domain=d
			for im in d['images']:
				if im['name'] == IMAGE:
					image = im
			for v in d['volumes']:
				if v['name'] in DATAVOLUMES:
					dataVolumes.append({"name":v['name'],'needsWriteAccess':True})
			for uv in d['userVolumes']:
				path=pathForUserVolume(uv)
				if path in USERVOLUMES:
					userVolumes.append({'name':uv['name'],'rootVolumeName':uv['rootVolumeName']
						,'owner':uv['owner'],'needsWriteAccess':True})
			break

	return(IMAGE, domain, userVolumes, dataVolumes, RESULTSFOLDERPATH)


### define script to run
def get_module_script(module): 
	script = {
		0: "still gotta make this", 
		1: "/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts/artic-module1-barcode-demux.sh", 
		2: "/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts/artic-module2-length-filter.sh",
		3: "/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts/artic-module3-normalization.sh", 
		4: "/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts/artic-module4-bundle.sh",
		5: "/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts/artic-module5-bundle.sh",
		6: "/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts/report_summary_table.sh"
	} 
	return script.get(module, "Invalid module number") 

def get_command(args):
	if args.module is not None and args.script==None:
		args.script=get_module_script(args.module)
	else:
		raise Exception("Must provide script's full path or module number for job execution")
	
	# Create logfile withing artic-pipeline directory
	sep="/artic-pipeline"
	logfile=args.input.split(sep,1)[0] + "/artic-pipeline_bashx.log"

	# Create command: merge bash script with parameters and input files for analysis...
	if args.threads is not None:
		command = "bash -x " + args.script + " -i " + args.input + " -t " + str(args.threads) + " &>> " + logfile
	else:
		command = "bash -x " + args.script + " -i " + args.input + " &>> " + logfile

	jobAlias=args.script.split("/")[-1]

	return command, jobAlias



#argument parsing for job submission
parser = argparse.ArgumentParser(description="Submit Bash Command as Job on Sciserver\nJob Config\n\tImage: Sciserver Essentials\n\tVolume: 'COVID-19'") 
parser.add_argument("-s", "--script", help="bash script to be executed as job", default=None)
parser.add_argument("-m", "--module", type=int, help="module from which to begin processing pipeline", choices=[0,1,2,3,4,5,6], default=None)
parser.add_argument("-i", "--input", help="input file to be processed by job")
parser.add_argument("-t", "--threads", help="threads", default=None)
args, unknown = parser.parse_known_args()



#MAIN
token, username = authenticate_user()

IMAGE, domain, userVolumes, dataVolumes, RESULTSFOLDERPATH = get_job_environment(token=token, USERNAME=username)

command, jobAlias = get_command(args)

job=submitShellCommandJob(shellCommand=command
                            , dockerComputeDomain = domain
                            , dockerImageName = IMAGE
                            , userVolumes = userVolumes, dataVolumes=dataVolumes
                            , resultsFolderPath = RESULTSFOLDERPATH
                            , jobAlias = jobAlias)

