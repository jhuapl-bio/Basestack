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
        echo -e "   -i      /full/path/to/sequencing_directory"
        echo -e "   -c      name of control sample provided in manifest (Default: 'NTC')"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------
# default control name
control_name="NTC"
#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:c:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) sequencing_run=$OPTARG ;;
		c) control_name=$OPTARG ;;
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
# Default values
#===================================================================================================

sequencing_run="${sequencing_run%/}"

# input files
sequencing_run_name=$(basename "$sequencing_run")
consensus_dir="${sequencing_run}"/artic-pipeline/4-draft-consensus
manifest="${sequencing_run}"/manifest.txt

# output directory
postfilter_dir="${sequencing_run}/artic-pipeline/5-post-filter"

# Postfiltering reference files
# also include reference file, see CombineVariants section
vcf_next="/home/user/idies/workspace/covid19/nextstrain/latest/alpha/alignments.vcf"
case_defs="/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts/variant_case_definitions.csv"
amplicons="/home/user/idies/workspace/covid19/sequencing_runs/amplicons"

# Posterfiltering NTC files for baselining
control_barcode=$(awk -F $'\t' -v control_name="${control_name}" '$2 == control_name { print $1 }' "${manifest}" | head -n1)
ntc_depthfile="${consensus_dir}/${control_name}_${control_barcode}.nanopolish.primertrimmed.rg.sorted.del.depth"
ntc_bamfile="${consensus_dir}/${control_name}_${control_barcode}.nanopolish.primertrimmed.rg.sorted.bam"

# CombineVariants reference files
reference="/home/user/idies/workspace/covid19/ncov_reference/sequence.fasta"
reference_annotation="/home/user/idies/workspace/covid19/ncov_reference/genes.gff3"

# Pangolin reference directory
pangolin_data="/home/user/idies/workspace/covid19/ncov_reference/lineages/lineages/data"

# Nextstrain clade reference directory
reference_gbk="/home/user/idies/workspace/covid19/ncov_reference/reference_seq.gb"
nextstrain_clades="/home/user/idies/workspace/covid19/ncov_reference/clades.tsv"

# snpEff reference file
snpEff_config="/home/user/idies/workspace/covid19/ncov_reference/snpEff.config"

# location of programs used by pipeline
software_path=/home/user/idies/workspace/covid19/code
JAVA_PATH="${software_path}/jdk-14/bin"

# log file
logfile="${postfilter_dir}"/logs/module5-postfilter-"${sequencing_run_name}"-$(date +"%F-%H%M%S").log

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

if [[ -f "${postfilter_dir}/module5-${sequencing_run_name}.complete" ]]; then
    >&2 echo "Warning: Module 5 already completed for ${sequencing_run_name}."
    #>&2 echo "    Archive Module 5 output and output for subsequent modules before rerunning"
    >&2 echo "         ...proceeding to final report generation"
	report_summary_table.sh -i "$sequencing_run"
    exit 1
fi

if [[ ! -d "${consensus_dir}" ]]; then
    >&2 echo "Error: Require Module 4 draft consensus output"
    >&2 echo "    ${consensus_dir} does not exist"
    exit 1
fi

if [[ ! -s "${manifest}" ]]; then
    >&2 echo "Error: Require Run Manifest for processing"
    >&2 echo "    ${manifest} does not exist"
    exit 1
fi

# verify module 4 completed for all non-control samples
module4_complete_flag="TRUE"
#while IFS=$'\t' read barcode name; do
#	if [[ ! -f "${consensus_dir}/module4-${name}_${barcode}.all_callers.complete" ]]; then
#	    >&2 echo "Error: Module 4 has not completed for sample ${name}. Module 4 must be completed for all samples before running Module 5"
#	    >&2 echo "    Details: Module 4 .complete file not found: ${consensus_dir}/module4-${name}_${barcode}.all_callers.complete"
#            module4_complete_flag="FALSE"
#	fi
#done < "${manifest}"


# verify existence of all reference files needed for full Module 5 execution
ref_files_found_flag="TRUE"
if [[ ! -s "${vcf_next}" ]]; then 
	>&2 echo "Error: Module 5 reference file not found: ${vcf_next}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -s "${case_defs}" ]]; then 
	>&2 echo "Error: Module 5 reference file not found: ${case_defs}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -s "${amplicons}" ]]; then 
	>&2 echo "Error: Module 5 reference file not found: ${amplicons}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -f "${ntc_depthfile}" ]]; then
	>&2 echo "Error: Control sample depth file not found: ${ntc_depthfile}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -f "${ntc_bamfile}" ]]; then
	>&2 echo "Error: Control Sample BAM file not found: ${ntc_bamfile}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -s "${snpEff_config}" ]]; then
	>&2 echo "RUN ${sequencing_run_name}: Error: snpEff Config file not found: ${snpEff_config}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -d "${pangolin_data}" ]]; then
	>&2 echo "RUN ${sequencing_run_name}: Error: Pangolin data directory not found: ${pangolin_data}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -s "${reference_annotation}" ]]; then
	>&2 echo "RUN ${sequencing_run_name}: Error: nCoV reference GFF not found: ${reference_annotation}"
	ref_files_found_flag="FALSE"	
fi

if [[ ! -s "${reference}" ]]; then
	>&2 echo "RUN ${sequencing_run_name}: Error: nCoV reference FASTA not found: ${reference}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -s "${reference_gbk}" ]]; then
	>&2 echo "RUN ${sequencing_run_name}: Error: nCoV reference GBK  not found: ${reference_gbk}"
	ref_files_found_flag="FALSE"
fi

if [[ ! -s "${nextstrain_clades}" ]]; then
	>&2 echo "RUN ${sequencing_run_name}: Error: nCov nextstrain clade definitions tsv not found: ${nextstrain_clades}"
	ref_files_found_flag="FALSE"
fi

# check submodule scripts are in path
paths_found_flag="TRUE"
pangolin=$(which artic-module5-pangolin.sh)
snpeff=$(which artic-module5-snpEff.sh)
run_postfilter=$(which artic-module5-postfilter.sh)
combine=$(which artic-module5-combine.sh)
nextstrain_clades=$(which artic-module5-nextstrain_clades.sh)

if [[ -z "${pangolin}" ]]; then
	echo  "RUN ${sequencing_run_name}: Error: artic-module5-pangolin.sh is not in your path! Please add this script to your path and rerun"
	paths_found_flag="FALSE"
fi

if [[ -z "${snpeff}" ]]; then
	echo  "RUN ${sequencing_run_name}: Error: artic-module5-snpEff.sh is not in your path! Please add this script to your path and rerun"
	paths_found_flag="FALSE"
fi

if [[ -z "${run_postfilter}" ]]; then
	echo  "RUN ${sequencing_run_name}: Error: artic-module5-postfilter.sh is not in your path! Please add this script to your path and rerun"
	paths_found_flag="FALSE"
fi

if [[ -z "${combine}" ]]; then
	echo  "RUN ${sequencing_run_name}: Error: artic-module5-combine.sh is not in your path! Please add this script to your path and rerun"
	paths_found_flag="FALSE"
fi

if [[ -z "${nextstrain_clades}" ]]; then
	echo  "RUN ${sequencing_run_name}: Error: artic-module5-nextstrain_clades.sh is not in your path! Please add this script to your path and rerun"
	paths_found_flag="FALSE"
fi


# create logs folder after successful completion of Module 4 for all samples and location of software/ref files for module 5 execution
if [[ "${module4_complete_flag}" == "TRUE" ]] && [[ "${ref_files_found_flag}" == "TRUE" ]] && [[ "${paths_found_flag}" == "TRUE" ]]; then
	mkdir -p "${postfilter_dir}/logs"
	conda env export > "${logfile%.log}-env.yml"
else
	exit 1
fi

#===================================================================================================
# MAIN BODY
#===================================================================================================

echo_log "====== Call to ${YELLOW}"$(basename $0)"${NC} from ${GREEN}"$(hostname)"${NC} ======"

echo_log "RUN ${sequencing_run_name}: ------ Module 5 Postfilter Paramters:"
echo_log "RUN ${sequencing_run_name}: timplab/ncov git hash: ${hash}"
echo_log "RUN ${sequencing_run_name}: sequencing run folder: ${CYAN}$sequencing_run${NC}"
echo_log "RUN ${sequencing_run_name}: recording software version numbers..."
echo_log "RUN ${sequencing_run_name}: Software version: $(samtools --version)"
echo_log "RUN ${sequencing_run_name}: input consensus directory: ${consensus_dir}"
echo_log "RUN ${sequencing_run_name}: sequencing run manifest: ${manifest}"
echo_log "RUN ${sequencing_run_name}: control sample name: ${control_name}"
echo_log "RUN ${sequencing_run_name}: control sample barcode: ${control_barcode}"
echo_log "RUN ${sequencing_run_name}: control sample depth file: ${ntc_depthfile}"
echo_log "RUN ${sequencing_run_name}: control sample bam file: ${ntc_bamfile}"
echo_log "RUN ${sequencing_run_name}: output postfilter directory: ${postfilter_dir}"
echo_log "RUN ${sequencing_run_name}: Reference fasta: ${reference}"
echo_log "RUN ${sequencing_run_name}: Reference annotation: ${reference_annotation}"
echo_log "RUN ${sequencing_run_name}: Case Definitions: ${case_defs}"
echo_log "RUN ${sequencing_run_name}: Amplicon sites: ${amplicons}"
echo_log "RUN ${sequencing_run_name}: pangolin data directory: ${pangolin_data}"
echo_log "RUN ${sequencing_run_name}: Reference genbank : ${reference_gbk}"
echo_log "RUN ${sequencing_run_name}: Nextstrain Clade definitions : ${nextstrain_clades}"
echo_log "RUN ${sequencing_run_name}: snpEff config file: ${snpEff_config}"
echo_log "RUN ${sequencing_run_name}: ------ processing Postfiltering and Annotation ------"

#---------------------------------------------------------------------------------------------------
# Module 5 Postfilter
#---------------------------------------------------------------------------------------------------

echo_log "RUN ${sequencing_run_name}: Starting Module 5 Postfilter Submodule 1 on ${sequencing_run}"

"${run_postfilter}" \
	-i "${consensus_dir}" \
	-d "${ntc_depthfile}" \
	-b "${ntc_bamfile}" \
	-v "${vcf_next}" \
	-c "${case_defs}" \
	-r "${reference}" \
	-a "${amplicons}" \
	-m "${manifest}" \
	-n "${control_name}" 2>> "${logfile}"

#---------------------------------------------------------------------------------------------------
# Module 5 Postfilter Summarization
#---------------------------------------------------------------------------------------------------

#check postfilter complete
variant_data_tracker=()
variant_fail_flag="FALSE"
while read barcode name; do
	if  [[ "$name" != "${control_name}" ]]; then
		if [[ ! -s "${postfilter_dir}/${name}_${barcode}.variant_data.txt" ]]; then
			echo_log "RUN ${sequencing_run_name}: Error: Sample ${name} failed to generate variant data output.  See logs."
			echo_log "RUN ${sequencing_run_name}:     ${postfilter_dir}/${name}_${barcode}*variant_data.txt does not exist."
			variant_fail_flag="TRUE"
		else
			variant_data_tracker+=("$name")
		fi
	fi
done < "${manifest}"

# Run summary
if [[ ${#variant_data_tracker[@]} -ge 1 ]]; then
	echo_log "RUN ${sequencing_run_name}: Module 5 Postfiltering completed for ${sequencing_run}"
	if [[ "${variant_fail_flag}" == "TRUE"  ]]; then
		echo_log "     At least one sample failed to produce any variant data.  See log for details"
	fi
	
	echo_log "RUN ${sequencing_run_name}: Starting Module 5 Postfilter Summarization on ${sequencing_run}"

	python "$software_path/ncov/pipeline_scripts/postfilter_summary.py" --rundir "${postfilter_dir}" 2>> "${logfile}"

	echo_log "RUN ${sequencing_run_name}: Module 5 Postfilter Summarization completed for ${sequencing_run}"
else
	echo_log "RUN ${sequencing_run_name}: Error: Module 5 Summarization not performed.  No valid variant data found to summarize."
	exit 1
fi
#---------------------------------------------------------------------------------------------------
# module 5 Combine Variants
#---------------------------------------------------------------------------------------------------

echo_log "RUN ${sequencing_run_name}: Combing variants for each sample..."

"${combine}" \
	-i "${postfilter_dir}" \
	-r "$reference" \
	-a "${reference_annotation}" \
	-m "$manifest" \
	-n "${control_name}" 2>> "${logfile}"

#---------------------------------------------------------------------------------------------------
# Module 5 Pangolin and snpEff
#---------------------------------------------------------------------------------------------------

combine_variants_complete_flag="TRUE"
while read barcode name; do
	if  [[ "$name" != "${control_name}" ]]; then
		if [[ " ${variant_data_tracker[@]} " =~ " ${name} " ]]; then
			if [[ ! -s "${postfilter_dir}/${name}_${barcode}.consensus.combined.vcf" ]]; then
				echo_log "RUN ${sequencing_run_name}: Error: Variants must be combined for all samples prior to running Pangolin and snpEff."
				echo_log "RUN ${sequencing_run_name}:     ${postfilter_dir}/${name}_${barcode}.consensus.combined.vcf does not exist"
				combine_variants_complete_flag="FALSE"
			fi
		fi
	fi
done < "${manifest}"

# Run pangolin and snpEff
if [[ "${combine_variants_complete_flag}" == "TRUE" ]]; then
	echo_log "RUN ${sequencing_run_name}: Starting Module 5 Pangolin and snpEff on ${sequencing_run}"

	"${pangolin}" \
		-i "${postfilter_dir}" \
		-d "${pangolin_data}" \
		-m "$manifest" 2>> "${logfile}"
	"${nextstrain_clades}" \
		-i "${postfilter_dir}" \
		-r "${reference_gbk}" \
		-c "${nextstrain_clades}" \
		-m "$manifest" 2>> "${logfile}"
	"${snpeff}" \
		-i "${postfilter_dir}" \
		-c "${snpEff_config}" \
		-m "$manifest" 2>> "${logfile}"

else
	echo_log "RUN ${sequencing_run_name}: Error: Module 5 Pangolin and snpEff not performed."
	exit 1
fi

#---------------------------------------------------------------------------------------------------
# Post-processing quality checking
#---------------------------------------------------------------------------------------------------

module5_complete_flag="TRUE"
if [[ ! -s "${postfilter_dir}/lineage_report.csv" ]]; then
	echo_log "RUN ${sequencing_run_name}: Error: Pangolin output file - ${postfilter_dir}/lineage_report.csv not detected or empty."
	#module5_complete_flag="FALSE"
fi

if [[ ! -s "${postfilter_dir}/nextstrain_clades.tsv" ]]; then
	echo_log "RUN ${sequencing_run_name}: Error: Assign nextstrain clades output file - ${postfilter_dir}/nextstrain_clades.tsv not detected or empty."
	#module5_complete_flag="FALSE"
fi

if [[ ! -s "${postfilter_dir}/final_snpEff_report.txt" ]]; then
	echo_log "RUN ${sequencing_run_name}: Error: snpEff output file - ${postfilter_dir}/final_snpEff_report.txt not detected or empty."
	module5_complete_flag="FALSE"
fi

if [[ "${module5_complete_flag}" == "TRUE" ]]; then
	echo_log "RUN ${sequencing_run_name}: Module 5 Postfilter completed for ${sequencing_run}"
	echo_log "RUN ${sequencing_run_name}: Creating ${postfilter_dir}/module5-${sequencing_run_name}.complete"
	touch "${postfilter_dir}/module5-${sequencing_run_name}.complete"

	echo_log "RUN ${sequencing_run_name}: Beginning Module 6 Report Generation..."

	report_summary_table.sh -i "$sequencing_run"
else
	echo_log "RUN ${sequencing_run_name}: Error: Module 5 did not complete."
	exit 1
fi
