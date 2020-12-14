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
        echo -e "   -b      /full/path/to/illumina/sample.bam (Default = 'None')"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------
illumina_bam="None"
#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:b:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) normalized_fastq=$OPTARG ;;
                b) illumina_bam=$OPTARG ;;
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
# Sequencing run directory and input files
#===================================================================================================

# sequencing run directory
sequencing_run=$(dirname $(dirname $(dirname $(dirname "$normalized_fastq"))))


#===================================================================================================
# Default values
#===================================================================================================

# input files
samplename=$(basename "$normalized_fastq" | awk -F '.' '{print $1}')
consensus_dir="${sequencing_run}/artic-pipeline/4-draft-consensus"
input_nanopolish_vcf="${consensus_dir}/${samplename}.nanopolish.merged.vcf"
input_medaka_vcf_zip="${consensus_dir}/${samplename}.medaka.merged.vcf.gz"
input_medaka_vcf="${consensus_dir}/${samplename}.medaka.merged.vcf"
input_nanopolish_bamfile="$consensus_dir/${samplename}.nanopolish.primertrimmed.rg.sorted.bam"
manifest="${sequencing_run}/manifest.txt"
run_configuration="${sequencing_run}/run_config.txt"

# location of programs used by pipeline
software_path="/home/user/idies/workspace/covid19/code"
JAVA_PATH="${software_path}/jdk-14/bin"
VariantValidatorPath="${software_path}/ncov/pipeline_scripts/VariantValidator"

# reference sequence
scheme_dir="$software_path/artic-ncov2019/primer_schemes"
protocol=$(awk '/primers/{ print $2 }' "${sequencing_run}/run_config.txt")
reference="$scheme_dir/$protocol/nCoV-2019.reference.fasta"

# Output directories and files
mpileup="${consensus_dir}/${samplename}.mpileup"
allelefreqcalls="${consensus_dir}/${samplename}.samtools.vcf"
filelist="${consensus_dir}/${samplename}.filelist.txt"

# log file
logfile="${consensus_dir}"/logs/module4-samtools-$(basename "${normalized_fastq%.covfiltered.fq}")-$(date +"%F-%H%M%S").log

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

if [[ ! -d "${consensus_dir}" ]]; then
    >&2 echo "Error: Require module 4 draft consensus output"
    >&2 echo "    ${consensus_dir} does not exist"
    exit 1
fi

if [[ ! -s "${run_configuration}" ]]; then
    >&2 echo "Error: Require a run_config.txt file in the sequencing run directory"
    exit 1
fi

if [[ ! -s "${manifest}" ]]; then
    >&2 echo "Error Require a manifest.txt file in the sequencing run directory"
    >&2 echo "${sequencing_run}/manifest.txt does not exist"
    exit 1
fi

if [[ ! -f "${normalized_fastq}" ]]; then
    >&2 echo "Error: Fastq file ${normalized_fastq} does not exist"
    exit 1
fi

if [[ ! -f "${input_nanopolish_vcf}" ]]; then
    >&2 echo "Error: Nanopolish output vcf file  does not exist"
    exit 1
elif [[ ! -f "${input_nanopolish_bamfile}" ]]; then
    >&2 echo "Error: Nanopolish output bam file ${input_nanopolish_bamfile} does not exist"
    exit 1
elif [[ ! -f "${input_medaka_vcf_zip}" ]] && [[ ! -f "${input_medaka_vcf}" ]]; then
    >&2 echo "Error: Medaka output vcf file ${input_medaka_vcf} or its zip do not exist"
    exit 1
else
    mkdir -p "${consensus_dir}/logs"
    conda env export > "${logfile%.log}-env.yml"
fi

 
#===================================================================================================
# MAIN BODY
#===================================================================================================

echo_log "====== Call to ${YELLOW}"$(basename $0)"${NC} from ${GREEN}"$(hostname)"${NC} ======"

echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}):------ Samtools / Merge Paramters:"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): timplab/ncov git hash: ${hash}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): sequencing run folder: ${CYAN}$sequencing_run${NC}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): recording software version numbers..."
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Software version: $(samtools --version)"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Reference fasta: ${reference}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): input fasta file: ${normalized_fastq}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): input vcfs: ${input_nanopolish_vcf}, ${input_medaka_vcf_zip}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): iput bam file: ${input_nanopolish_bamfile}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): output consensus directory: ${consensus_dir}"
echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}):------ processing Samtools/Merge ------"

#---------------------------------------------------------------------------------------------------
# module 4
#---------------------------------------------------------------------------------------------------

echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Starting Module 4 Samtools on ${input_nanopolish_bamfile}"

samtools mpileup --reference "${reference}" "${input_nanopolish_bamfile}" -o "${mpileup}" 2>> "${logfile}"

# Run samtools-based variant calling
"$JAVA_PATH/java" \
    -cp "${VariantValidatorPath}/src" CallVariants \
    pileup_file="${mpileup}" \
    out_file="${allelefreqcalls}" 2>> "${logfile}"

echo_log "Starting Module 4 Merging and Allele Frequencies on \
    ${input_nanopolish_vcf}, ${input_medaka_vcf}, ${allelefreqcalls}"

# Run merging and allele frequency counts
if [[ ! -r "${input_medaka_vcf}" ]]; then
    echo_log "Unzipping ${input_medaka_vcf_zip}"
    gunzip -c "${input_medaka_vcf_zip}" > "${input_medaka_vcf}" 2>> "${logfile}"
fi


printf "${input_nanopolish_vcf}\n${input_medaka_vcf}\n${allelefreqcalls}" > "${filelist}"

# Run merging
"$JAVA_PATH/java" \
    -cp "${VariantValidatorPath}/src" MergeVariants \
    illumina_bam="${illumina_bam}" \
    file_list="${filelist}" \
    out_file="${consensus_dir}/${samplename}.all_callers.combined.noallelefreqs.vcf" 2>> "${logfile}"

"$JAVA_PATH/java" \
    -cp "${VariantValidatorPath}/src" AddAlleleFrequencies \
    vcf_file="${consensus_dir}/${samplename}.all_callers.combined.noallelefreqs.vcf"  \
    ont_mpileup="${mpileup}" \
    out_file="${consensus_dir}/${samplename}.all_callers.combined.vcf" 2>> "${logfile}"

#---------------------------------------------------------------------------------------------------


if [[ -f "${consensus_dir}/${samplename}.all_callers.combined.vcf" ]] && \
   [[ -f "${mpileup}" ]] && \
   [[ -f "${consensus_dir}/${samplename}.nanopolish.primertrimmed.rg.sorted.depth" ]] && \
   [[ -f "${consensus_dir}/${samplename}.nanopolish.consensus.fasta" ]]; then
	echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Module 4 Samtools and Merging: processing complete"
	echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Creating ${consensus_dir}/module4-${samplename}.all_callers.complete"
	touch "${consensus_dir}/module4-${samplename}.all_callers.complete"
else
	echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}): Error: Module 4 Samtools and Merging failed."
	echo_log "SAMPLE $(basename ${normalized_fastq%.covfiltered.fq}):    All Module 4 output files for ${samplename} could not be detected with file size greater than zero."
	exit 1
fi

module4_complete_flag="TRUE"
while IFS=$'\t' read barcode name; do
	if [[ ! -f "${consensus_dir}/module4-${name}_${barcode}.all_callers.complete" ]]; then
		module4_complete_flag="FALSE"
	fi
done < "${manifest}"

if [[ "${module4_complete_flag}" == "TRUE" ]]; then
	echo_log "Beginning Module 5 for ${sequencing_run}."
	artic-module5-bundle.sh -i "$sequencing_run"
fi
