import pymongo
import os
import argparse 
import yaml
import pandas as pd
#brew services start mongodb-community@5.0 to start on MacOS
import getpass
from pathlib import Path

import datetime 

class PasswordPromptAction(argparse.Action):
    def __init__(self,
             option_strings,
             dest=None,
             nargs=0,
             default=None,
             required=False,
             type=None,
             metavar=None,
             help=None):
        super(PasswordPromptAction, self).__init__(
             option_strings=option_strings,
             dest=dest,
             nargs=nargs,
             default=default,
             required=required,
             metavar=metavar,
             type=type,
             help=help)

    def __call__(self, parser, args, values, option_string=None):
        password = getpass.getpass()
        setattr(args, self.dest, password)

pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)
parser = argparse.ArgumentParser(description = "Connect to a mongo db, and load new/variants to services, procedures, or modules")
parser.add_argument('-u', dest='user', type=str, required=False, help="Username for mongodb")
parser.add_argument('-p', dest='password', action=PasswordPromptAction, type=str, required=False, help="Password for mongodb")
parser.add_argument('--cert', dest='cert',  type=str, required=False, help="Use Certificate to authenticate mongodb connection")
parser.add_argument('--uri', dest='uri',  type=str, required=False,  default="basestack0-shard-00-00.v4ead.mongodb.net:27017,basestack0-shard-00-01.v4ead.mongodb.net:27017,basestack0-shard-00-02.v4ead.mongodb.net:27017", help="default uri for accessing mongo atlas db")
parser.add_argument('--name', required = True, default="basestack", type=str,  help = 'output.json file')
parser.add_argument('--url', required = False, default="basestack", type=str,  help = 'output.json file')
parser.add_argument('--local', required = False, default=False, action='store_true', help = 'Defaults to local running mongodb at default 27017 port')
parser.add_argument('--api_key', required = False, default=None, type=str, help = 'API key to push/pull')
parser.add_argument('--overwrite_version', required = False, default=False, action='store_true', help = 'If set, overwrite latest version of service, procedure, or module 0.1 if any change in config versus last, most recent version')
parser.add_argument('--config', required = False, default=None,type=str, help = 'Config YAML for mapping directory of YAMLS to table in db')



# parser.add_argument('--source_dir', required = True, default=None, action='store_true', help = 'Merge one or more jsons (out.json e.g.) that is generated from the main functionality, then exit')

arg_parsed = parser.parse_args()


def main():


    ######################################################################################################################################
    ####### Define MAIN variables for use later   ########################################################################################
    ######################################################################################################################################    





    args = vars(arg_parsed) 
    myclient= None
    mydb  = None
    name = args['name']
    remoteURI = args['uri']
    if args['local']:
        myclient = pymongo.MongoClient("mongodb://localhost:27017/")
        mydb = myclient[args['name']]
    else:
        if args['cert']:
            
            uri = "mongodb://"+remoteURI+"/"+name+"?ssl=true&replicaSet=atlas-13839b-shard-0&authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority"
            client = pymongo.MongoClient(uri,
                                tls=True,
                                tlsCertificateKeyFile=args['cert'])
            mydb = client[name]
            collection = mydb['services']
        else:
            client = pymongo.MongoClient(
                "mongodb://"+user+":"+password+"@"+remoteURI+"/"+name+"?ssl=true&replicaSet=atlas-m5acz4-shard-0&authSource=admin&retryWrites=true&w=majority")
            mydb = client.test
    config = None
    if args['config']:
        with open(args['config'], "r") as stream:
            try:
                config = yaml.safe_load(stream)
            except yaml.YAMLError as exc:
                print(exc)
    full_config = dict()
    if config: 
        for key, item in config.items():
            if key not in full_config: 
                full_config[key] = []
            for specification in item:
                formatted = specification['format']
                if formatted  == 'yaml':
                    formatted = 'yml'
                if not formatted:
                    formatted = "yml"
                if 'recursive' in specification and specification['recursive']:
                    files = list(Path(specification['path']).rglob("*."+formatted))
                else:
                    files = [os.path.join(specification['path'], f) for f in os.listdir(specification['path']) if f.endswith(formatted)]
                if "ignores" in specification:
                    files = [f for f in files if os.path.basename(f) not in specification['ignores']]
                for f in files:
                    with open(f, "r") as stream:
                        try:
                            target_config = yaml.safe_load(stream)
                            for entry in target_config:
                                if ('name' in entry):
                                    full_config[key].append(entry)
                        except yaml.YAMLError as exc:
                            print(exc)
    # print(yaml.dump(full_config, allow_unicode=True, default_flow_style=False))
    current_time  =  datetime.datetime.now()
    for key, item in full_config.items():
        collection = mydb[key]
        for entry in item:
            cursor = collection.find({"name": {"$eq": entry['name']} })
            lent = list(cursor)
            same = False
            version = 1.00
            latest_version = version
            latest_version_entry = None
            if (entry['version'] == 'local' or  ( 'custom' in entry and  entry['custom'] ) ):
                del entry['version']
            if len(lent) == 0:
                entry['version'] = version
                entry['date_added'] = current_time
                collection.insert_one(entry)
            else:
                # latestVersion = max(lent, key=lambda x:x['version'])
                
                for doc in lent:
                    del doc['_id']
                    if doc == entry:
                        print(doc,"_____same_____")
                        same = True
                        # break
                    else:
                        if "version" in doc and doc['version'] >= latest_version:
                            latest_version = doc['version']
                            latest_version_entry  = doc
                if same:
                    print("same found...")
                latest_version = round(latest_version, 2)
                # print(latest_version_entry,"\n",entry)
                if latest_version_entry and "version" in latest_version_entry:
                    del latest_version_entry['version']
                if latest_version_entry and "date_added" in latest_version_entry:
                    del latest_version_entry['date_added']
                if latest_version_entry   == entry:
                    print("same found")
                else:
                    entry['date_added'] = current_time                     
                    print("else")
                    if args['overwrite_version']:
                        collection.delete_many({
                            "name": {"$eq": entry['name']},
                            "version": {"$eq": latest_version }
                        })
                        entry['version'] = latest_version 
                    else:
                        entry['version'] = round(latest_version  + 0.10, 2)
                    # if "version" not in entry:
                    #     entry['version'] = version
                    collection.insert_one(entry)
            cursor = collection.find({"name": {"$eq": entry['name']} })
if __name__ == "__main__":
    main()    