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
        echo -e "   -i      /full/path/to/normalizd_alignment.sam"
        echo -e "   -t      number of threads (default: 6)"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------
#default threads
threads=6
#default fast5
batch_size=4000
#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:t:b:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) samfile=$OPTARG ;;
                t) threads=$OPTARG ;;
                b) batch_size=$OPTARG ;;
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
sequencing_run=$(dirname $(dirname $(dirname $(dirname "$samfile"))))

#===================================================================================================
# Default values
#===================================================================================================

# input files, these files should be in the sequencing run directory
manifest="${sequencing_run}/manifest.txt"
run_configuration="${sequencing_run}/run_config.txt"

# Output directory
outdir="$sequencing_run"/artic-pipeline/fast5_subset_human-filtered

sample_name=$(basename "${samfile%.covfiltered.sam}")

# log file
logfile="${outdir}"/logs/module4-fast5-subset-"${sample_name}"-$(date +"%F-%H%M%S").log

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

if [[ ! -s "${run_configuration}" ]]; then
    >&2 echo "Error: Require a run_config.txt file in the sequencing run directory"
    >&2 echo "${sequencing_run}/run_config.txt does not exist"
    exit 1
fi

if [[ ! -s "${sequencing_run}/manifest.txt" ]]; then
    >&2 echo "Error: Require a manifest.txt file in the sequencing run directory"
    >&2 echo "${sequencing_run}/manifest.txt does not exist"
    exit 1
fi

if [[ ! -f "${sequencing_run}"/artic-pipeline/3-normalization/module3-"${sample_name}".complete ]]; then
    >&2 echo "Error: Module 3 Normalization must be completed prior to running Module 4."
    >&2 echo "${sequencing_run}/artic-pipeline/3-normalization/module3-$sample_name.complete does not exist"
    exit 1
else
    mkdir -p "$outdir/logs"
    conda env export > "${logfile%.log}-env.yml"
fi

if [[ -s "$outdir/${sample_name}-no_human-covfiltered_0.fast5" ]]; then
    >&2 echo "Warning: Fast5 subset already exists for this sample: $outdir/${sample_name}-no_human-covfiltered_0.fast5"
    >&2 echo "    Archive previous fast5 subset processing before rerunning."
    exit 1
fi




#===================================================================================================
# MAIN BODY
#===================================================================================================

echo_log "====== Call to ${YELLOW}"$(basename $0)"${NC} from ${GREEN}"$(hostname)"${NC} ======"
echo_log "SAMPLE ${sample_name}: ------ Fast5 Subset Paramters:"
echo_log "SAMPLE ${sample_name}: timplab/ncov git hash: ${hash}"
echo_log "SAMPLE ${sample_name}: sequencing run folder: ${CYAN}$sequencing_run${NC}"
echo_log "SAMPLE ${sample_name}: run configuration file: ${sequencing_run}/run_config.txt"
echo_log "SAMPLE ${sample_name}: run manifest file: ${manifest}"
echo_log "SAMPLE ${sample_name}: sample sam: ${samfile}"
echo_log "SAMPLE ${sample_name}: output directory: ${outdir}"
echo_log "SAMPLE ${sample_name}: ------ processing fast5 subset output ------"

#---------------------------------------------------------------------------------------------------
# module 4
#---------------------------------------------------------------------------------------------------

read_ids="${samfile%.sam}-read_ids.txt"

awk '{if ( $1 ~ "^@" ){}else{print $1}}' "$samfile" > "${read_ids}" 2>> "$logfile"

fast5_subset --input "${sequencing_run}/fast5_pass" --save_path "${outdir}" --read_id_list "${read_ids}" -f "${sample_name}-no_human-covfiltered_" --batch_size "${batch_size}" -t $threads --recursive 2>> "$logfile"


#---------------------------------------------------------------------------------------------------

echo_log "SAMPLE ${sample_name}: Module 4 post-normalization fast5 subsetting complete"
#chgrp -R 5102 $demux_dir

