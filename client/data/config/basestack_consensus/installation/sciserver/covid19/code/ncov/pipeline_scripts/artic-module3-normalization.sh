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
	echo -e "   -i      path to 2-length-filter fastq file (i.e. full/path/sequencing_run/artic-pipeline/2-length-filter/<sample>.fq)"
    echo -e "   -t      number of threads"
	echo -e ""
}

#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:t:" OPTION
do
	case $OPTION in
		h) usage; exit 1 ;;
		i) fastq=$OPTARG ;;
	        t) threads=$OPTARG ;;
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

sequencing_run=$(dirname $(dirname $(dirname "$fastq")))

# location of programs used by pipeline
software_path=/home/user/idies/workspace/covid19/code
JAVA_PATH="${software_path}/jdk-14/bin"
samtools_path="${software_path}/samtools-1.10/bin"
NormalizeCoveragePath="${software_path}/ncov/pipeline_scripts/CoverageNormalization"

# input files and directories
base=$(basename "${fastq%.fastq}")
manifest="${sequencing_run}/manifest.txt"
run_configuration="${sequencing_run}/run_config.txt"
gather_dir="${sequencing_run}/artic-pipeline/2-length-filter"

# location for primer schemes
scheme_dir="$software_path/artic-ncov2019/primer_schemes"

# primer protocol
protocol=$(awk '/primers/{ print $2 }' "${run_configuration}")
organism=$(echo "$protocol" | cut -d"/" -f1)

# reference fasta
reference="$scheme_dir/$protocol/$organism.reference.fasta"

# Output directories
normalize_dir="${sequencing_run}/artic-pipeline/3-normalization/$base"

# Optional program parameters - check with Tom , even_strand or median_strand
norm_parameters="coverage_threshold=150 --qual_sort --even_strand" 

# log file
logfile=$(dirname "${normalize_dir}")/logs/module3-"${base}"-$(date +"%F-%H%M%S").log

#git hash
GIT_DIR="$(dirname $(readlink -f $(which $(basename $0))))/../.git"
export GIT_DIR
hash=$(git rev-parse --short HEAD)


#===================================================================================================
# QUALITY CHECKING
#===================================================================================================

if [[ ! -d "${sequencing_run}" ]]; then
    >&2 echo_log "Error Sequencing run ${sequencing_run} does not exist"
    exit 1
fi

if [[ ! -s "${run_configuration}" ]]; then
    >&2 echo_log "Error Require a run_config.txt file in the sequencing run directory"
    exit 1
fi

if [[ ! -s "${manifest}" ]]; then
    >&2 echo_log "Error Require a manifest.txt file in the sequencing run directory"
    exit 1
fi

if [[ ! -f "${fastq}" ]]; then
    >&2 echo_log "Error: Module 2 output '${fastq}' not found"
    exit 1
fi

if [[ ! -f "${gather_dir}/module2-${base}.complete" ]]; then
    >&2 echo "Error: Processing for Module 2 for sample ${base} is incomplete (cannot locate ${gather_dir}/module2-${base}.complete"
    exit 1
else
    mkdir -p "${normalize_dir}"
    mkdir -p $(dirname "${normalize_dir}")/logs
    conda env export > "${logfile%.log}-env.yml"
fi

# check for existence of a module 3 output "complete" files.  will not overwrite previous processing.
if [[ -f $(dirname "${normalize_dir}")/module3-"${base}".complete ]]; then
    >&2 echo "Warning: Module 3 processing for this sample already completed: ${sequencing_run}/artic-pipeline/3-normalization/module3-${base}.complete"
    #>&2 echo "    Archive Module 3 and all subsequent module processing prior to rerunning."
    >&2 echo "         ...proceeding to Module 4"
	align_out="$normalize_dir/$base.sam"
	out_sam="${align_out%.sam}.covfiltered.sam"
	artic-module4-bundle.sh -i "${out_sam%.sam}.fq" -t 5
    exit 1
fi


#===================================================================================================
# MAIN BODY
#===================================================================================================

echo_log "====== Call to ${YELLOW}"$(basename $0)"${NC} from ${GREEN}"$(hostname)"${NC} ======"
echo_log "SAMPLE ${base}: timplab/ncov git hash: ${hash}"
echo_log "SAMPLE ${base}: sequencing run folder: ${CYAN}$sequencing_run${NC}"
echo_log "SAMPLE ${base}: recording software version numbers"
echo_log "SAMPLE ${base}: Coverage Normalization from: https://github.com/mkirsche/CoverageNormalization"
echo_log "SAMPLE ${base}: Coverage Normalization parameters: $norm_parameters"
echo_log "SAMPLE ${base}: run configuration file: ${sequencing_run}/run_config.txt"
echo_log "SAMPLE ${base}: run manifest file: ${manifest}"
echo_log "SAMPLE ${base}: inputs: Length directory: ${gather_dir}"
echo_log "SAMPLE ${base}: output normalization directory: ${normalize_dir}"
echo_log "SAMPLE ${base}: ------ processing pipeline output ------"

#---------------------------------------------------------------------------------------------------
# module 3
#---------------------------------------------------------------------------------------------------

echo_log "SAMPLE ${base}: Starting normalize module 3"


#### bad coding here... any way to fix? does module 3 require presence inside dir?
cd "$normalize_dir"

# create alignment file
align_out="$normalize_dir/$base.sam"
echo_log "SAMPLE ${base}: output file = $align_out" 

samtools faidx "$reference"

minimap2 -a \
	-x map-ont \
	-t 32 \
	"$reference" \
	"$fastq" > "$align_out" 2>> "$logfile"

samtools sort "$align_out" > "${align_out%.sam}.bam" 2>> "$logfile"
samtools depth -a -d 0 "${align_out%.sam}.bam" > "${align_out%.sam}.depth" 2>> "$logfile"

# normalization, txt file output went to working directory
out_sam="${align_out%.sam}.covfiltered.sam"

"$JAVA_PATH"/java \
	-cp "$NormalizeCoveragePath/src" \
	NormalizeCoverage \
	input="$align_out" \
	$norm_parameters 2>> "$logfile"

# fastq conversion
samtools fastq "${out_sam}" > "${out_sam%.sam}.fq" 2>> "$logfile"

samtools sort "${out_sam}" > "${out_sam%.sam}.bam" 2>> "$logfile"
samtools depth -a -d 0 "${out_sam%.sam}.bam" > "${out_sam%.sam}.depth" 2>> "$logfile"

#---------------------------------------------------------------------------------------------------

#chgrp -R 5102 $demux_dir

#===================================================================================================
# QUALITY CHECKING AND MODULE 4 JOB SUBMISSION
#===================================================================================================

if [[ ! -f "${out_sam%.sam}.fq" ]]; then
    >&2 echo_log "SAMPLE ${base}: Error: Module 3 output ${out_sam%.sam}.fq not found"
    exit 1
else
	echo_log "SAMPLE ${base}: Module 3 complete for sample '${base}'"
	touch $(dirname "${normalize_dir}")/module3-"${base}".complete

	artic-module4-bundle.sh -i "${out_sam%.sam}.fq" -t 5
fi