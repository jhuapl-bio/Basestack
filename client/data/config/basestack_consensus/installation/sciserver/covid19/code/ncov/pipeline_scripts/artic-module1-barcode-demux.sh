#!/bin/bash
source /home/user/idies/workspace/covid19/bashrc
conda activate artic-ncov2019

#---------------------------------------------------------------------------------------------------

# set default values here

# define colors for error messages
red='\033[0;31m'
RED='\033[1;31m'
green='\033[0;32m'
GREEN='\033[1;32m'
yellow='\033[0;33m'
YELLOW='\033[1;33m'
blue='\033[0;34m'
BLUE='\033[1;34m'
purple='\033[0;35m'
PURPLE='\033[1;35m'
cyan='\033[0;36m'
CYAN='\033[1;36m'
NC='\033[0m'

# usage function
usage() {
	echo -e "usage: ${YELLOW}$0${NC} [options]"
	echo -e ""
	echo -e "OPTIONS:"
	echo -e "   -h      show this message"
	echo -e "   -i      path/to/sequencing_run_folder"
	echo -e ""
}

#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:" OPTION
do
	case $OPTION in
		h) usage; exit 1 ;;
		i) sequencing_run=$OPTARG ;;
		?) usage; exit ;;
	esac
done

if ((OPTIND == 1))
then
    usage
    exit
fi

#===================================================================================================
# DEFINE FUNCTIONS
#===================================================================================================

echo_log() {
	input="$*"
	# if input is non-empty string, prepend initial space
	if [[ -n "$input" ]]; then
		input=" $input"
	fi
	# print to STDOUT
	echo -e "[$(date +"%F %T")]$input"
	# print to log file (after removing color strings)
	echo -e "[$(date +"%F %T")]$input\r" | sed -r 's/\x1b\[[0-9;]*m?//g' >> "$logfile"
}

#===================================================================================================
# Default values
#===================================================================================================

sequencing_run="${sequencing_run%/}"

# location of programs used by pipeline - double check if bashrc doesn't have to hardcoded paths
software_path=/home/user/idies/workspace/covid19/code
guppy_barcoder_path="${software_path}/ont-guppy-cpu/bin"

# input files, these files should be in the sequencing run directory
run_configuration="${sequencing_run}/run_config.txt"
barcode_file=$(awk '/barcoding/{ print $2 }' "${run_configuration}")
fastq_dir="${sequencing_run}/fastq_pass"
manifest="${sequencing_run}/manifest.txt"

# Output directories
demux_dir="${sequencing_run}/artic-pipeline/1-barcode-demux"

# log file
logfile="${demux_dir}"/logs/module1-$(date +"%F-%H%M%S").log

#git hash
GIT_DIR="$(dirname $(readlink -f $(which $(basename $0))))/../.git"
export GIT_DIR
hash=$(git rev-parse --short HEAD)

#===================================================================================================
# QUALITY CHECKING
#===================================================================================================

# check for the existence of the sequencing run directory
if [[ ! -d "${sequencing_run}" ]]; then
    >&2 echo "Error: Sequencing run ${sequencing_run} does not exist"
    exit 1
fi

# check for existence of run_config.txt and for barcoding 
if [[ ! -s "${run_configuration}" ]]; then
    >&2 echo "Error: Require a run_config.txt file in the sequencing run directory"
    exit 1
else
    if [[ -z $(grep "barcoding" "${run_configuration}") ]]; then
        echo "Error: require barcoding file within run_config.txt"
        >&2 echo "Error: barcode file not found within run_config.txt"
        exit 1
    fi
fi

# check for existence of manifest.txt and that it has two columns
if [[ ! -s "${manifest}" ]]; then 
    >&2 echo "Error: Require a manifest.txt file in the sequencing run directory"
    exit 1
else
    columns=$( awk -F' ' '{if(NF>max){max=NF}}END{print max}' "${manifest}" )
    if [[ "$columns" -ne 2 ]]; then 
        >&2 echo "Error: manifest.txt must have two columns and be tab delimited.\n\tColumn 1: Barcodes\n\tColumn 2 Sample Names"
        exit 1
    fi
fi

# check for existence of fastq_pass directory
if [[ ! -d "${sequencing_run}/fastq_pass" ]]; then
    >&2 echo "Error: Require fastq_pass directory in the sequencing run directory"
    exit 1
fi

# check for existence of a module 1 complete file.  will not overwrite previous processing
if [[ -f "$demux_dir/1-barcode-demux.complete" ]]; then
    >&2 echo "Warning: Processing for Module 1 was prevously completed: ${demux_dir}1-barcode-demux.complete"
    #>&2 echo "     Archive all previously run modules prior to beginning a new processing chain."

    # before launching all the sub-processes, check to see if module 4 is already complete
    consensus_dir="${sequencing_run}/artic-pipeline/4-draft-consensus"
    module4_complete_flag="TRUE"
    while IFS=$'\t' read barcode name; do
        if [[ ! -f "${consensus_dir}/module4-${name}_${barcode}.all_callers.complete" ]]; then
            module4_complete_flag="FALSE"
        fi
    done < "${manifest}"

    if [[ "${module4_complete_flag}" == "TRUE" ]]; then
        echo_log "         It seems module 4 is also already complete."
        echo_log "         ...proceeding to Module 5"
        artic-module5-bundle.sh -i "$sequencing_run"
    else
        >&2 echo "         ...proceeding to Module 2"
        while read barcode name; do
            artic-module2-length-filter.sh -i "$demux_dir"/"$barcode"
        done < "$manifest"
    fi
    exit 1
else
    mkdir -p "$demux_dir/logs"
    conda env export > "${logfile%.log}-env.yml"
fi


#===================================================================================================
# MAIN BODY
#===================================================================================================

echo_log "====== Call to ${YELLOW}"$(basename $0)"${NC} from ${GREEN}"$(hostname)"${NC} ======"
echo_log "RUN $(basename ${sequencing_run}): timplab/ncov git hash: ${hash}"
echo_log "RUN $(basename ${sequencing_run}): sequencing run folder: ${CYAN}$sequencing_run${NC}"
echo_log "RUN $(basename ${sequencing_run}): recording software version numbers"
echo_log "RUN $(basename ${sequencing_run}): $(${guppy_barcoder_path}/guppy_barcoder --version)"
echo_log "RUN $(basename ${sequencing_run}): run configuration file: ${sequencing_run}/run_config.txt"
echo_log "RUN $(basename ${sequencing_run}): run manifest file: ${sequencing_run}/manifest.txt"
echo_log "RUN $(basename ${sequencing_run}): inputs: fastq_directory: ${fastq_dir}, arrangements files: ${barcode_file}"
echo_log "RUN $(basename ${sequencing_run}): output demultiplex directory: ${demux_dir}"
echo_log "RUN $(basename ${sequencing_run}): ------ processing pipeline output ------"

#---------------------------------------------------------------------------------------------------
# module 1 
#---------------------------------------------------------------------------------------------------

echo_log "RUN $(basename ${sequencing_run}): Starting guppy demux module 1"

"$guppy_barcoder_path/guppy_barcoder" \
	--require_barcodes_both_ends \
	-i "$fastq_dir" \
	-s "$demux_dir" \
	--arrangements_files "$barcode_file" 2>> "$logfile"

while read barcode name; do
mv "$demux_dir"/"${barcode/NB/barcode}" "$demux_dir"/"${barcode}"
done < "$manifest" 2>> "$logfile"
    
#---------------------------------------------------------------------------------------------------

#chgrp -R 5102 $demux_dir

#===================================================================================================
# QUALITY CHECKING AND MODULE 2 JOB SUBMISSION
#===================================================================================================

if [[ ! -d "$demux_dir" ]]; then
    >&2 echo_log "RUN $(basename ${sequencing_run}): Error $demux_dir not created"
    exit 1
fi

while read barcode name; do
    if [[ -d "$demux_dir/$barcode" ]]; then
        complete=TRUE
    else
        complete=FALSE
        echo_log "RUN $(basename ${sequencing_run}): Error ${demux_dir}/${barcode} does not exist"
    fi
done < "$manifest"

if [[ "$complete"==TRUE ]]; then
   touch "$demux_dir/1-barcode-demux.complete"
   echo_log "RUN $(basename ${sequencing_run}): Module 1, Guppy Barcoder complete"
fi
    
if [[ -f "$demux_dir/1-barcode-demux.complete" ]]; then
    while read barcode name; do
        echo_log "RUN $(basename ${sequencing_run}): " 'artic-module2-length-filter.sh i "$demux_dir"/"$name"'       
        artic-module2-length-filter.sh -i "$demux_dir"/"$barcode"
    done < "$manifest" 2>> "$logfile"
fi




