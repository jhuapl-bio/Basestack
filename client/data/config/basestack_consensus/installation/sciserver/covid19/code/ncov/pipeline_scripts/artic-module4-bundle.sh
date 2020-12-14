#!/bin/bash
source /home/user/idies/workspace/covid19/bashrc
conda activate jhu-ncov

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
        echo -e "   -i      /full/path/to/normalizd_sample.fq"
        echo -e "   -t      number of threads (default: 6)"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------
# set defaults
threads=6
logfile=/dev/null

#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:t:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) normalized_fastq=$OPTARG ;;
                t) threads=$OPTARG ;;
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


#---------------------------------------------------------------------------------------------------
# module 4 - bundle
#---------------------------------------------------------------------------------------------------

sequencing_run=$(dirname $(dirname $(dirname $(dirname "$normalized_fastq"))))
manifest="${sequencing_run}/manifest.txt"
consensus_dir="${sequencing_run}/artic-pipeline/4-draft-consensus"

if [[ ! -f "${normalized_fastq}" ]]; then
    >&2 echo_log "Error: Module 3 output '${normalized_fastq}' not found"
    exit 1
fi

if [[ ! -d "${sequencing_run}" ]]; then
    >&2 echo_log "Error: Sequencing run ${sequencing_run} does not exist"
    exit 1
fi

if [[ ! -s "${manifest}" ]]; then
    >&2 echo_log "Error: Require a manifest.txt file in the sequencing run directory"
    exit 1
fi

module4_complete_flag="TRUE"
while IFS=$'\t' read barcode name; do
	if [[ ! -f "${consensus_dir}/module4-${name}_${barcode}.all_callers.complete" ]]; then
		module4_complete_flag="FALSE"
	fi
done < "${manifest}"

if [[ "${module4_complete_flag}" == "TRUE" ]]; then
	echo_log "Warning: Module 4 complete for ${sequencing_run}."
        echo_log "         ...proceeding to Module 5"
        artic-module5-bundle.sh -i "$sequencing_run"
else
        subset=$(which artic-module4-fast5-subset.sh)
        medaka=$(which artic-module4-draft-consensus-medaka.sh)
        nanopolish=$(which artic-module4-draft-consensus-nanopolish.sh)
        samtools=$(which artic-module4-draft-consensus-samtools.sh)

        "$subset" -i "${normalized_fastq%fq}sam" -t $threads
        "$medaka" -i "$normalized_fastq" -t $threads
        "$nanopolish" -i "$normalized_fastq" -t $threads
        "$samtools" -i "$normalized_fastq"
fi
#---------------------------------------------------------------------------------------------------
