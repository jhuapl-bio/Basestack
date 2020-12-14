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
        echo -e "   -i      barcode fastq directory (i.e. /full/path/to/module1/output/barcode)"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------

# parse input arguments
# parse input arguments
while getopts "hi:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) barcode_dir=$OPTARG ;;
                ?) usage; exit ;;
       esac
done

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
# Sequencing run directory
#===================================================================================================

# sequencing run directory
sequencing_run=$(dirname $(dirname $(dirname "$barcode_dir")))
sequencing_run="${sequencing_run%/}"

#===================================================================================================
# Default values
#===================================================================================================

# location of programs used by pipeline

# input files, these files should be located in the sequencing run directory
manifest="${sequencing_run}/manifest.txt"

# grabbing sample name from manifest given input barcode directory
barcode=$(basename "${barcode_dir}")
name=$(grep "${barcode}" "${manifest}" | cut -d $'\t' -f 2)

# Output directories
gather_dir="${sequencing_run}/artic-pipeline/2-length-filter"

# log file
logfile="${gather_dir}"/logs/module2-"${name}"-$(date +"%F-%H%M%S").log

#git hash
GIT_DIR="$(dirname $(readlink -f $(which $(basename $0))))/../.git"
export GIT_DIR
hash=$(git rev-parse --short HEAD)

#===================================================================================================
# QUALITY CHECKING
#===================================================================================================

if [[ ! -d "${sequencing_run}" ]]; then
    >&2 echo "Error: Sequencing run ${sequencing_run} does not exist"
    exit 1
fi

if [[ ! -s "${sequencing_run}/run_config.txt" ]]; then
    >&2 echo "Error: Require a run_config.txt file in the sequencing run directory"
    exit 1
fi

if [[ ! -s "${manifest}" ]]; then
    >&2 echo "Error: Require a manifest.txt file in the sequencing run directory"
    exit 1
fi

if [[ ! -d "${sequencing_run}/artic-pipeline/1-barcode-demux" ]]; then
    >&2 echo "Error: Require Module 1-barcode-demux output. Module 1 Output: '${sequencing_run}/artic-pipeline/1-barcode-demux' does not exist"
    exit 1
fi

if [[ ! -d "${barcode_dir}" ]]; then
    >&2 echo "Error: Input barcode directory does not exist: '${sequencing_run}/artic-pipeline/1-barcode-demux'"
    exit 1
fi

if [[ ! -f "${sequencing_run}/artic-pipeline/1-barcode-demux/1-barcode-demux.complete" ]]; then
    >&2 echo "'Error: 1-barcode-demux.complete file' not detected in Module 1 output directory.  Module 1 must complete on all barcodes prior to proceeding to Module 2.."
    exit 1
else
    mkdir -p "$gather_dir/logs"
    conda env export > "${logfile%.log}-env.yml"
fi

# check for existence of a module 2 ouput directory.  will not overwrite previously processing
if [[ -f "${gather_dir}/module2-${name}_${barcode}.complete" ]]; then
    >&2 echo "Warning: Processing for Module 2 already completed for this sample: ${gather_dir}/module2-${name}_${barcode}.complete"
    #>&2 echo "    Archive the previously run Module 2 output and all subsequent module ouput prior to rerunning."
    >&2 echo "         ...proceeding to Module 3"
	artic-module3-normalization.sh -i "${gather_dir}/${name}_${barcode}.fastq"
    exit 1
fi


#===================================================================================================
# MAIN BODY
#===================================================================================================

echo_log "====== Call to ${YELLOW}"$(basename $0)"${NC} from ${GREEN}"$(hostname)"${NC} ======"
echo_log "SAMPLE: ${name}: timplab/ncov git hash: ${hash}"
echo_log "SAMPLE: ${name}: sequencing run folder: ${CYAN}$sequencing_run${NC}"
echo_log "SAMPLE: ${name}: Software version and inputs:"
echo_log "SAMPLE: ${name}: Artic guppyplex from: $(artic --version)"
echo_log "SAMPLE: ${name}: input barcode directory: ${barcode_dir}"
echo_log "SAMPLE: ${name}: run manifest file: ${manifest}"
echo_log "SAMPLE: ${name}: sample name extracted from manifest: ${name}"
echo_log "SAMPLE: ${name}: output gather directory: ${gather_dir}"
echo_log "SAMPLE: ${name}: ------ processing pipeline output ------"

#---------------------------------------------------------------------------------------------------
# module 2
#---------------------------------------------------------------------------------------------------

echo_log "SAMPLE: ${name}: Starting artic guppyplex module 2 on $sequencing_run, sample ${name}"

artic guppyplex \
	--skip-quality-check \
	--min-length 400 \
	--max-length 700 \
	--directory "${barcode_dir}" \
    --prefix "${gather_dir}/${name}" 2>> "$logfile"


#---------------------------------------------------------------------------------------------------

# sciserver at one point needed recursive permission fixes to enable group wide access
#chgrp -R 5102 $demux_dir

#===================================================================================================
# QUALITY CHECKING AND MODULE 3 JOB SUBMISSION
#===================================================================================================

if [[ ! -d "$gather_dir" ]]; then
    >&2 echo_log "SAMPLE ${name}: Error: $gather_dir not created"
    exit 1
fi

if [[ ! -f "${gather_dir}/${name}_${barcode}.fastq" ]]; then
    >&2 echo_log "SAMPLE: ${name}: Error: Module 2 output for sample '${name}' not found"
    exit 1
else
 	echo_log "SAMPLE ${name}: Module 2 - Guppyplex complete"
	touch "${gather_dir}/module2-${name}_${barcode}.complete"

	echo_log "SAMPLE ${name}: executing artic-module3-normalization.sh -i ${gather_dir}/${name}_${barcode}.fastq"

	artic-module3-normalization.sh -i "${gather_dir}/${name}_${barcode}.fastq"
fi
