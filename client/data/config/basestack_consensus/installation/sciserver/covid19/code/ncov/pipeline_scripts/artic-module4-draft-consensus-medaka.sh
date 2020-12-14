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
        echo -e "   -i      /full/path/to/normalizd_sample.fq"
        echo -e "   -t      number of threads (default: 6)"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------
#default threads
threads=6
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

#===================================================================================================
# Sequencing run directory
#===================================================================================================

# sequencing run directory
sequencing_run=$(dirname $(dirname $(dirname $(dirname "$normalized_fastq"))))

#===================================================================================================
# Default values
#===================================================================================================

# location of programs used by pipeline
software_path=/home/user/idies/workspace/covid19/code

# input files, these files should be in the sequencing run directory
manifest="${sequencing_run}/manifest.txt"
run_configuration="${sequencing_run}/run_config.txt"

# location for primer schemes
scheme_dir="${software_path}/artic-ncov2019/primer_schemes"

# primer protocol
protocol=$(awk '/primers/{ print $2 }' "${run_configuration}")

# Output directories
consensus_dir="${sequencing_run}/artic-pipeline/4-draft-consensus"

# log file
logfile="${consensus_dir}"/logs/module4-medaka-$(basename "${normalized_fastq%.covfiltered.fq}")-$(date +"%F-%H%M%S").log

# Optional program parameters
out_prefix="$consensus_dir/$(basename ${normalized_fastq%.covfiltered.fq}.medaka)"

#git hash
GIT_DIR="$(dirname $(readlink -f $(which $(basename $0))))/../.git"
export GIT_DIR
hash=$(git rev-parse --short HEAD)

#===================================================================================================
# QUALITY CHECKING
#===================================================================================================

if [[ ! -f "${normalized_fastq}" ]]; then
    >&2 echo "Error: Fastq file ${normalized_fastq} does not exist"
    exit 1
fi

if [[ ! -d "${sequencing_run}" ]]; then
    >&2 echo "Error: Sequencing run ${sequencing_run} does not exist"
    exit 1
fi

if [[ ! -d "${scheme_dir}" ]]; then
    >&2 echo "Error: Primer scheme directory ${scheme_dir} does not exist"
    exit 1
fi

if [[ ! -s "${sequencing_run}/run_config.txt" ]]; then
    >&2 echo "Error: Require a run_config.txt file in the sequencing run directory"
    >&2 echo "${sequencing_run}/run_config.txt does not exist"
    exit 1
fi

if [[ ! -s "${sequencing_run}/manifest.txt" ]]; then
    >&2 echo "Error: Require a manifest.txt file in the sequencing run directory"
    >&2 echo "${sequencing_run}/manifest.txt does not exist"
    exit 1
fi

if [[ ! -f "${sequencing_run}"/artic-pipeline/3-normalization/module3-$(basename "${normalized_fastq%.covfiltered.fq}").complete ]]; then
    >&2 echo "Error: Module 3 Normalization must be completed prior to running Module 4."
    >&2 echo "${sequencing_run}/artic-pipeline/3-normalization/module3-$(basename ${normalized_fastq%.covfiltered.fq}).complete does not exist"
    exit 1
else
    mkdir -p "${consensus_dir}/logs"
    conda env export > "${logfile%.log}-env.yml"
fi

if [[ -f "$consensus_dir"/$(basename "${normalized_fastq%.covfiltered.fq}").medaka.merged.vcf ]]; then
    >&2 echo "Warning: Medaka VCF already exsists for this sample: $consensus_dir/$(basename ${normalized_fastq%.covfiltered.fq}).medaka.merged.vcf"
    >&2 echo "    Archive all previous medaka processing before rerunning."
    exit 1
fi






#===================================================================================================
# MAIN BODY
#===================================================================================================

echo_log "====== Call to ${YELLOW}"$(basename $0)"${NC} from ${GREEN}"$(hostname)"${NC} ======"

echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): ------ Medaka Paramters:"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): timplab/ncov git hash: ${hash}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): sequencing run folder: ${CYAN}$sequencing_run${NC}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): recording software version numbers..."
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Software version: $(medaka --version)"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): run configuration file: ${sequencing_run}/run_config.txt"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): prep protocol: ${protocol}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): primer schemes: ${scheme_dir}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): run manifest file: ${manifest}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): fasta file: ${normalized_fastq}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): output medaka directory: ${consensus_dir}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): ------ processing pipeline output ------"

#---------------------------------------------------------------------------------------------------
# module 4
#---------------------------------------------------------------------------------------------------

echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Starting Module 4 Medaka on $normalized_fastq"

artic minion \
        --medaka \
        --normalise 1000000 \
        --threads $threads \
        --scheme-directory "$scheme_dir" \
        --read-file "$normalized_fastq" \
        "$protocol" "$out_prefix" 2>> "$logfile"



#---------------------------------------------------------------------------------------------------

echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Module 4 Medaka: processing complete"
#chgrp -R 5102 $demux_dir

