#!/bin/bash

source /home/user/idies/workspace/covid19/bashrc
conda activate jhu-ncov

#---------------------------------------------------------------------------------------------------

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
	echo -e "   -i      sequencing run folder"
	echo -e "   -o      output PDF"
	echo -e "   -n      nextstrain path (default: ${CYAN}/home/user/idies/workspace/covid19/nextstrain${NC})"
	echo -e ""
}
#===================================================================================================
# SET DEFAULT VALUES
#===================================================================================================

# set default values here
logfile="/dev/null"
tempdir="/tmp"
skip_igv="false"

# report current hash of miseq-analysis git repo
bin_path="$(dirname $0)"
#script_path=$(dirname $(readlink -f $0))
GIT_DIR="$script_path/../.git"
export GIT_DIR
hash=$(git rev-parse --short HEAD)

primerscheme_path="$bin_path/../../artic-ncov2019/primer_schemes"
protocol="nCoV-2019/V3"
protocol_path="$bin_path/../../artic-ncov2019/rampart"
nextstrain_path="$bin_path/../../../nextstrain"
reference="$primerscheme_path/$protocol/nCoV-2019.reference.fasta"
bed="$primerscheme_path/$protocol/nCoV-2019.bed"

stats_base="artic-pipeline/run_stats"
demux_base="artic-pipeline/1-barcode-demux"
lengthfilter_base="artic-pipeline/2-length-filter"
normalize_base="artic-pipeline/3-normalization"
draftconsensus_base="artic-pipeline/4-draft-consensus"
postfilter_base="artic-pipeline/5-post-filter"
nextstrain_base="artic-pipeline/6-nextstrain"

#===================================================================================================
# PARSE INPUT ARGUMENTS
#===================================================================================================

# parse input arguments
while getopts "hi:o:n:" OPTION
do
	case $OPTION in
		h) usage; exit 1 ;;
		i) run_path=$OPTARG ;;
		o) out_file=$OPTARG ;;
		n) nextstrain_path=$OPTARG ;;
		?) usage; exit ;;
	esac
done

#===================================================================================================
# QUALITY CHECKING
#===================================================================================================

if ! [[ -d "$run_path" ]]; then
	echo -e "${RED}Error: run path ${CYAN}$run_path${RED} does not exist.${NC}"
	usage
	exit
fi

run_info="$run_path/run_info.txt"
if ! [[ -s "$run_info" ]]; then
	echo -e "${RED}Error: run info file ${CYAN}$run_info${RED} does not exist.${NC}"
	usage
	exit
fi

run_title=$(grep "title" "${run_path}/run_info.txt" | cut -f2)

if [[ -z "$out_file" ]]; then
	out_file="$run_path/artic-pipeline/report.pdf"
fi
out_rmd="${out_file%.pdf}.Rmd"

if ! [[ -s "$reference" ]]; then
	echo -e "${RED}Error: reference sequence ${CYAN}$reference${RED} does not exist.${NC}"
	usage
	exit
else
	ref_header=$(head -n1 "$reference" | cut -c2-)
	ref_length=$("$bin_path/fix_fasta.sh" "$reference" | tail -n1 | awk '{print length($1)}')
fi

if ! [[ -d "$bin_path" ]]; then
	echo -e "${RED}Error: reference sequence ${CYAN}$reference${RED} does not exist.${NC}"
	usage
	exit
fi

vcfigv_repo_path="$bin_path/../../vcfigv"
if ! [[ -d "$vcfigv_repo_path" ]]; then
	echo -e "${RED}Error: vcfigv repository ${CYAN}$vcfigv_repo_path${RED} does not exist.${NC}"
	usage
	exit
fi

if [[ -z "$stats_path" ]]; then
	stats_path="$run_path/$stats_base"
fi
if ! [[ -d "$stats_path" ]]; then
	mkdir -p "$stats_path"
fi
if [[ -z "$demux_path" ]]; then
	demux_path="$run_path/$demux_base"
fi
if ! [[ -d "$demux_path" ]]; then
	echo -e "${RED}Error: demux path ${CYAN}$demux_path${RED} does not exist.${NC}"
	usage
	exit
fi
if [[ -z "$lengthfilter_path" ]]; then
	lengthfilter_path="$run_path/$lengthfilter_base"
fi
if ! [[ -d "$lengthfilter_path" ]]; then
	echo -e "${RED}Error: length filter path ${CYAN}$lengthfilter_path${RED} does not exist.${NC}"
	usage
	exit
fi
if [[ -z "$normalize_path" ]]; then
	normalize_path="$run_path/$normalize_base"
fi
if ! [[ -d "$normalize_path" ]]; then
	echo -e "${RED}Error: normalization path ${CYAN}$normalize_path${RED} does not exist.${NC}"
	usage
	exit
fi
if [[ -z "$draftconsensus_path" ]]; then
	draftconsensus_path="$run_path/$draftconsensus_base"
fi
if ! [[ -d "$draftconsensus_path" ]]; then
	echo -e "${RED}Error: draft consensus path ${CYAN}$draftconsensus_path${RED} does not exist.${NC}"
	usage
	exit
fi
if [[ -z "$nextstrain_path" ]]; then
	nextstrain_path="$run_path/$nextstrain_base"
fi
if ! [[ -d "$nextstrain_path" ]]; then
	echo -e "${RED}Error: nextstrain path ${CYAN}$nextstrain_path${RED} does not exist.${NC}"
#	usage
#	exit
fi
if [[ -z "$postfilter_path" ]]; then
	postfilter_path="$run_path/$postfilter_base"
fi
if ! [[ -d "$postfilter_path" ]]; then
	echo -e "${RED}Error: post-filter path ${CYAN}$postfilter_path${RED} does not exist.${NC}"
	usage
	exit
fi
postfilt_summary="$postfilter_path/postfilt_summary.txt"
if ! [[ -s "$postfilt_summary" ]]; then
	echo -e "${RED}Error: post-filter summary ${CYAN}$postfilt_summary${RED} does not exist.${NC}"
	usage
	exit
fi
postfilt_all="$postfilter_path/postfilt_all.txt"
if ! [[ -s "$postfilt_summary" ]]; then
	echo -e "${RED}Error: post-filter full report ${CYAN}$postfilt_all${RED} does not exist.${NC}"
	usage
	exit
fi
snpeff_report="$postfilter_path/final_snpEff_report.txt"
if ! [[ -s "$snpeff_report" ]]; then
	echo -e "${RED}Error: SnpEff report ${CYAN}$snpeff_report${RED} does not exist.${NC}"
#	usage
#	exit
fi
lineage_report="$postfilter_path/lineage_report.csv"
if ! [[ -s "$lineage_report" ]]; then
	echo -e "${RED}Error: Pangolin lineage report ${CYAN}$lineage_report${RED} does not exist.${NC}"
#	usage
#	exit
fi

#===================================================================================================
# DEFINE FUNCTIONS
#===================================================================================================

#---------------------------------------------------------------------------------------------------
# log function that will output to STDOUT and a log file
echo_log() {

	input="$*"

	# if input is non-empty string, prepend initial space
	if [[ -n "$input" ]]; then
		input=" $input"
	fi

	# print to STDOUT
	echo -e "[$(date +"%F %T")]$prefix$input"

	# print to log file (after removing color strings)
	echo -e "[$(date +"%F %T")]$prefix$input" | gawk '{ printf("%s\n", gensub(/\x1b\[[0-9;]*m?/, "", "g", $0)); }' >> "$logfile"
}

#---------------------------------------------------------------------------------------------------

#===================================================================================================
# BUILD MARKDOWN FILE
#===================================================================================================

sed -e "s@<RUN_PATH>@${run_path}@" \
	-e "s@<RUN_TITLE>@${run_title}@" \
	-e "s@<PROTOCOL_PATH>@${protocol_path}@" \
	-e "s@<NEXTSTRAIN_PATH>@${nextstrain_path}@" \
	"$bin_path/report-template.Rmd" > "$out_rmd"

Rscript -e "rmarkdown::render('"$out_rmd"')"

#---------------------------------------------------------------------------------------------------

echo_log "${GREEN}Done${NC}"
