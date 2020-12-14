#!/bin/bash

source /home/user/idies/workspace/covid19/bashrc
conda activate jhu-ncov

export JAVA_HOME="/home/user/idies/workspace/covid19/code/jdk-14"
export PATH=$JAVA_HOME/bin:$PATH

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
	echo -e "   -s      skip IGV"
	echo -e "   -o      output folder (default: ${CYAN}<run-folder>/artic-pipeline/run_stats${NC})"
	echo -e "   -1      barcode demux folder (default: ${CYAN}<run-folder>/artic-pipeline/1-barcode-demux${NC})"
	echo -e "   -2      length filter folder (default: ${CYAN}<run-folder>/artic-pipeline/2-length-filter${NC})"
	echo -e "   -3      normalization folder (default: ${CYAN}<run-folder>/artic-pipeline/3-normalization${NC})"
	echo -e "   -4      draft consensus folder (default: ${CYAN}<run-folder>/artic-pipeline/4-draft-consensus${NC})"
	echo -e "   -5      post-filter folder (default: ${CYAN}<run-folder>/artic-pipeline/5-post-filter${NC})"
	echo -e "   -6      nextstrain folder (default: ${CYAN}<run-folder>/artic-pipeline/6-nextstrain${NC})"
	echo -e ""
}

#===================================================================================================
# SET DEFAULT VALUES
#===================================================================================================

# set default values here
logfile="/dev/null"
tempdir="/tmp"
skip_igv="true"

# report current hash of miseq-analysis git repo
bin_path="$(dirname $0)"
#script_path=$(dirname $(readlink -f $0))
GIT_DIR="$script_path/../.git"
export GIT_DIR
hash=$(git rev-parse --short HEAD)

primerscheme_path="$bin_path/../../artic-ncov2019/primer_schemes"
protocol="nCoV-2019/V3"
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
while getopts "hi:sm:b:p:r:o:1:2:3:4:5:6:" OPTION
do
	case $OPTION in
		h) usage; exit 1 ;;
		i) run_path=$OPTARG ;;
		s) skip_igv="true" ;;
		m) manifest=$OPTARG ;;
		b) bin_path=$OPTARG ;;
		p) run_path=$OPTARG ;;
		r) reference=$OPTARG ;;
		o) stats_path=$OPTARG ;;
		1) demux_path=$OPTARG ;;
		2) lengthfilter_path=$OPTARG ;;
		3) normalize_path=$OPTARG ;;
		4) draftconsensus_path=$OPTARG ;;
		5) postfilter_path=$OPTARG ;;
		6) nextstrain_path=$OPTARG ;;
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

if ! [[ -s "$manifest" ]]; then
	manifest="$run_path/manifest.txt"
	if ! [[ -s "$manifest" ]]; then
		echo -e "${RED}Error: manifest file ${CYAN}$manifest${RED} does not exist.${NC}"
		usage
		exit
	fi
fi

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
if [[ "$skip_igv" != "true" ]]; then
	vcfigv_repo_path="$bin_path/../../vcfigv"
	if ! [[ -d "$vcfigv_repo_path" ]]; then
		echo -e "${RED}Error: vcfigv repository ${CYAN}$vcfigv_repo_path${RED} does not exist.${NC}"
		usage
		exit
	fi
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
# MAIN BODY
#===================================================================================================

amplicons="$stats_path/amplicons.txt"
outfile="$stats_path/summary.txt"
demuxfile="$stats_path/demux_count.txt"
depthfile="$stats_path/depth-all.txt"
mutations_pos="$stats_path/mutations-pos.txt"
mutations_all="$stats_path/mutations-all.txt"
mutations_table="$stats_path/mutations-table.txt"
depth_mutations_pos="$stats_path/depth_mutations-pos.txt"
depth_mutations_all="$stats_path/depth_mutations-all.txt"
depth_mutations_table="$stats_path/depth_mutations-table.txt"

echo_log "====== Call to ${YELLOW}"$(basename $0)"${NC} from ${GREEN}"$(hostname)"${NC} ======"

# create directory to hold temporary files
runtime=$(date +"%Y%m%d%H%M%S%N")
workdir="$tempdir/report_summary_table-$runtime"
mkdir -m 775 -p "$workdir"

echo_log "recording software version numbers"
echo_log "current git hash: $hash"
echo_log "  guppy barcoder: "
echo_log "input arguments"
echo_log "  sequencing run folder: ${CYAN}$run_path${NC}"
echo_log "    1)    barcode demux: ├── ${CYAN}${demux_path#$run_path}${NC}"
echo_log "    2)    length filter: ├── ${CYAN}${lengthfilter_path#$run_path}${NC}"
echo_log "    3)    normalization: ├── ${CYAN}${normalize_path#$run_path}${NC}"
echo_log "    4)  draft consensus: ├── ${CYAN}${draftconsensus_path#$run_path}${NC}"
echo_log "    5)      post-filter: ├── ${CYAN}${postfilter_path#$run_path}${NC}"
echo_log "    6)       nextstrain: └── ${CYAN}${nextstrain_path#$run_path}${NC}"
echo_log "  manifest: ${CYAN}$manifest${NC}"
echo_log "  reference sequence: ${CYAN}$reference${NC}"
echo_log "  working directory: ${CYAN}$workdir${NC}"
echo_log "  threads: ${CYAN}1${NC}"
echo_log "output arguments"
echo_log "  log file: ${CYAN}$logfile${NC}"
echo_log "  amplicons: ${CYAN}${amplicons}${NC}"
echo_log "  summary file: ${CYAN}${summary#$run_path}${NC}"
echo_log "  demux file: ${CYAN}${demuxfile#$run_path}${NC}"
echo_log "  depth file: ${CYAN}${depthfile#$run_path}${NC}"
echo_log "  mutation file: ${CYAN}${mutations_table#$run_path}${NC}"
echo_log "------ processing pipeline output ------"

scheme_amplicon_profile.sh "$bed" > "$amplicons"

printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\n" \
	"Sample" \
	"Barcode" \
	"Raw Reads" \
	"Length filter" \
	"SARS-CoV-2 Aligned" \
	"Coverage" \
	"Consensus" > "$outfile"

if ! [[ -s "$demuxfile" ]]; then
	echo_log "Pulling barcode demux stats"
	find "$demux_path" -mindepth 1 -maxdepth 1 -type d | sort | while read barcode; do
		find "$barcode" -maxdepth 1 -name "*.fastq" | while read f; do
			wc -l < "$f"
		done | awk -v BARCODE=$(basename "$barcode") '{sum+=$0}END{printf("%s\t%s\n", sum/4, BARCODE)}' >> "$demuxfile"
	done
else
	echo_log "Demux count already present - will not overwrite it"
fi

ont_depth_thresh=$(head -n2 "$postfilt_all" | awk -F $'\t' '{if(NR==1){for(i=1; i<=NF; i++){if($i=="ont_depth_thresh"){col=i;}}}else{print $col}}')
echo_log "Depth threshold: $ont_depth_thresh"

echo_log "Reading manifest"
while read barcode label; do

	echo_log "  $barcode"

	filebase="${label}_${barcode}"

	demux_reads=$(grep "$barcode" "$stats_path/demux_count.txt" | cut -f1)
	gather=$(find "$lengthfilter_path" -name "*$barcode.fastq")

	if [[ -s "$gather" ]]; then
		length_filter=$(($(wc -l < "$gather") / 4))
	else
		length_filter=0
	fi
	alignment=$(find "$normalize_path" -name "*$barcode.bam")
	if [[ -s "$gather" ]]; then
		aligned_reads=$(samtools view "$alignment" | wc -l)
	else
		aligned_reads=0
	fi
	normalized_alignment=$(find "$draftconsensus_path" -name "*$barcode*.nanopolish.sorted.bam" ! -name "*trimmed*")
	normalized_reads=$(samtools idxstats "$normalized_alignment" | grep "$ref_header" | cut -f3)
	draft_consensus=$(find "$draftconsensus_path" -name "*$barcode*.nanopolish.consensus.fasta")
	consensus_length=$(($ref_length - $(tail -n+2 "$draft_consensus" | grep -o N | wc -l)))
	trimmed_alignment=$(find "$draftconsensus_path" -name "*${barcode}*.nanopolish.primertrimmed.rg.sorted.bam")
	del_depth_file="${trimmed_alignment%.bam}.del.depth"
	vcf=$(find "$draftconsensus_path" -name "*${barcode}*.all_callers.combined.vcf")
	post_filter=$(find "$postfilter_path" -name "*$barcode*.variant_data.txt")
	final_consensus=$(find "$postfilter_path" -regextype posix-extended -regex ".*/.*$barcode.*(complete|partial).fasta")

	echo_log "    FASTQ file: ${gather#$run_path/}"
	echo_log "    full alignment: ${alignment#$run_path/}"
	echo_log "    normalized alignment: ${normalized_alignment#$run_path/}"
	echo_log "    primer trimmed alignment: ${trimmed_alignment#$run_path/}"
	echo_log "    depth file: ${del_depth_file#$run_path/}"
	echo_log "    variant file: ${vcf#$run_path/}"
	echo_log "    draft consensus: ${draft_consensus#$run_path/}"
	echo_log "    variant data: ${post_filter#$run_path/}"
	echo_log "    final consensus: ${final_consensus#$run_path/}"

	echo_log "    barcode stats:"
	echo_log "      number of reads: $length_filter"
	echo_log "      aligned reads: $aligned_reads"
	echo_log "      normalized reads: $normalized_reads"
	echo_log "      unambiguous consensus nucleotides: $consensus_length"

	depth_outfile="$normalize_path/$filebase/$filebase.depth"
	normalized_depth_outfile="$normalize_path/$filebase/$filebase.covfiltered.depth"
	mutations_outfile="$stats_path/mutations-$filebase.txt"
	depth_mask_outfile="$stats_path/amplicon_depth_mask-$filebase.txt"
	depth_mutations_outfile="$stats_path/depth_mutations-$filebase.txt"
	trimmed_depth_outfile="${trimmed_alignment%.bam}.depth"

	echo_log "    adding line to summary file"
	flag=$(grep "^$label" "$postfilt_summary" | cut -d$'\t' -f7)
	printf "%s\t%s\t%'d\t%'d\t%'d\t%'d (%s %%)\t%s\n" \
		"$label" \
		"$barcode" \
		"$demux_reads" \
		"$length_filter" \
		"$aligned_reads" \
		"$consensus_length" \
		$(echo "$consensus_length" | awk -v L="$ref_length" '{printf("%0.1f", (100*$1/L))}') \
		"$flag" >> "$outfile"

	echo_log "    creating depth file"
	samtools depth -d 0 -a "$alignment" > "$depth_outfile"

	echo_log "    creating normalized depth file"
	samtools depth -d 0 -a "$normalized_alignment" > "$normalized_depth_outfile"

	if [[ -s "$final_consensus" ]]; then
		echo_log "    creating mutations file"
		"$bin_path/mutations.sh" \
			$("$bin_path/fix_fasta.sh" "$reference" | tail -n1) \
			$("$bin_path/fix_fasta.sh" "$final_consensus" | tail -n1) \
			| tail -n+55 | head -n-67 > "$mutations_outfile"

		echo_log "    creating depth mutations file"

		awk -F $'\t' -v THRESH="$ont_depth_thresh" '{
			if(NR==FNR) {
				if(NR==1) {
					for(i=1; i<=NF; i++) {
						if($i == "mask_start") {
							mask_start_col = i;
						} else if($i == "mask_stop") {
							mask_stop_col = i;
						}
					}
				} else {
					mask_start[$1] = $mask_start_col;
					mask_stop[$1] = $mask_stop_col;
				}
			} else {
				depth[$2] = $3;
			}
		} END {
			for(i=1; i<mask_start[1]; i++) {
				printf("%s\n", i);
			}
			for(amplicon in mask_start) {
				start=mask_start[amplicon];
				stop=mask_stop[amplicon];
				depth_min[amplicon]=999999999999;
				for(i=start; i<=stop; i++) {
					if(depth[i] <= depth_min[amplicon]) {
						depth_min[amplicon] = depth[i];
					}
				}
				if(depth_min[amplicon] <= THRESH) {
					if(amplicon > 1 && depth_min[amplicon-1] <= THRESH) {
						start = mask_start[amplicon-1];
					}
					for(i=start; i<=stop; i++) {
						printf("%s\n", i);
					}
				}
			}
			for(i=mask_stop[98]; i<=29903; i++) {
				printf("%s\n", i);
			}
		}' "$amplicons" "$del_depth_file" | sort -n | uniq > "$depth_mask_outfile"

		awk -F $'\t' '{
			if(NR==FNR) {
				depth_mask[$1] = 1;
			} else {
				REF=gensub(/([A-Z]+)[0-9]+[A-Z]+/, "\\1", "g", $1);
				POS=gensub(/[A-Z]+([0-9]+)[A-Z]+/, "\\1", "g", $1);
				ALT=gensub(/[A-Z]+[0-9]+([A-Z]+)/, "\\1", "g", $1);
				if(!depth_mask[POS]) {
					printf("%s\n", $1);
				}
			}
		}' "$depth_mask_outfile" "$mutations_outfile" > "$depth_mutations_outfile"
	fi

	echo_log "    creating trimmed depth file"
	samtools depth -d 0 -a "$trimmed_alignment" > "$trimmed_depth_outfile"

	if [[ -s "$vcf" && -s "$trimmed_alignment" && skip_igv == "false" ]]; then

		outPrefix=$(basename "${vcf%.all_callers.combined.vcf}")
		igv_out_path="$stats_path/igv"
		mkdir -p "$igv_out_path"

		"$JAVA_HOME/bin/java" -cp "$vcfigv_repo_path/src" \
			Vcf2Bat \
			--squish \
			--nocombine \
			--svg \
			aln="$trimmed_alignment" \
			var="$vcf" \
			genome="$reference" \
			outprefix="$outPrefix" \
			bed="$bed"

		mv "$outPrefix.bat" "$outPrefix"
		mv "$outPrefix" "$igv_out_path"

		"$vcfigv_repo_path/xvfb-run" \
			--auto-servernum "$vcfigv_repo_path/IGV_2.8.2/igv.sh" \
			-b "$pipelinepath/$outPrefix/$outPrefix.bat"

	fi

done < "$manifest"

printf "\tuncalled\t%'d\tNA\tNA\tNA\tNA\n" $(grep unclassified "$stats_path/demux_count.txt" | cut -f1) >> "$outfile"

echo_log "Consolidating depth"
find "$normalize_path" -name "*.depth" ! -name "*covfiltered.depth" -print0 | while read -d $'\0' f; do
	base=$(basename "$f")
	awk -v BASE="${base%%.*}" '{printf("%s\t%s\n", BASE, $0);}' "$f"
done > "$depthfile"

echo_log "Consolidating normalized depth"
find "$normalize_path" -name "*.covfiltered.depth" -print0 | while read -d $'\0' f; do
	base=$(basename "$f")
	awk -v BASE="${base%.covfiltered.depth}" '{printf("%s\t%s\n", BASE, $0);}' "$f"
done > "${depthfile/-all/-norm-all}"

echo_log "Consolidating trimmed depth"
find "$draftconsensus_path" -name "*.nanopolish.primertrimmed.rg.sorted.del.depth" -print0 | while read -d $'\0' f; do
	base=$(basename "$f")
	awk -v BASE="${base%.nanopolish.primertrimmed.rg.sorted.del.depth}" '{printf("%s\t%s\n", BASE, $0);}' "$f"
done > "${depthfile/-all/-trim-all}"

echo_log "Consolidating depth masks"
find "$stats_path" -name "amplicon_depth_mask-*.txt" ! -name "amplicon_depth_mask_all.txt" -print0 | while read -d $'\0' f; do
	base=$(basename "${f%.txt}")
	awk -v BASE="${base#amplicon_depth_mask-}" '{printf("%s\t%s\n", BASE, $0);}' "$f"
done > "$stats_path/amplicon_depth_mask_all.txt"

echo_log "Identifying mutations"
rm -f "$mutations_all"
find "$stats_path" -name "mutations-*.txt" ! -name "mutations-pos.txt" ! -name "mutations-all.txt" ! -name "mutations-table.txt" | while read fn; do
	base=$(basename "${fn%.txt}")
	base="${base#mutations-}"
	awk -v BASE="$base" 'BEGIN{ printf("%s", BASE); } {
		printf("\t%s", $1);
	} END { printf("\n"); }' "$fn" >> "$mutations_all"
	cut -c2- "$fn" | rev | cut -c2- | rev
done | sort | uniq > "$mutations_pos"

awk '{
	if(NR==FNR) {
		a[$1];
	} else {
		for(i=2; i<=NF; i++) {
			pos=substr($i,2,length($i)-2);
			m[$1][pos] = $i;
		}
	}
} END {
	printf("virus");
	PROCINFO["sorted_in"] = "@ind_num_asc";
	for(i in a) { printf("\t%s", i); }
	for(sample in m) {
		printf("\n%s", sample);
		for(i in a){
			printf("\t");
			if(i in m[sample]) {
				printf("%s", m[sample][i]);
			}
		}
	}
	printf("\n");
}' "$mutations_pos" "$mutations_all" > "$mutations_table"

echo_log "Identifying mutations above depth threshold"
rm -f "$depth_mutations_all"
find "$stats_path" -name "depth_mutations-*.txt" ! -name "depth_mutations-pos.txt" ! -name "depth_mutations-all.txt" ! -name "depth_mutations-table.txt" | while read fn; do
	base=$(basename "${fn%.txt}")
	base="${base#depth_mutations-}"
	awk -v BASE="$base" 'BEGIN{ printf("%s", BASE); } {
		printf("\t%s", $1);
	} END { printf("\n"); }' "$fn" >> "$depth_mutations_all"
	cut -c2- "$fn" | rev | cut -c2- | rev
done | sort | uniq > "$depth_mutations_pos"

awk '{
	if(NR==FNR) {
		a[$1];
	} else {
		for(i=2; i<=NF; i++) {
			pos=substr($i,2,length($i)-2);
			m[$1][pos] = $i;
		}
	}
} END {
	printf("virus");
	PROCINFO["sorted_in"] = "@ind_num_asc";
	for(i in a) { printf("\t%s", i); }
	for(sample in m) {
		printf("\n%s", sample);
		for(i in a){
			printf("\t");
			if(i in m[sample]) {
				printf("%s", m[sample][i]);
			}
		}
	}
	printf("\n");
}' "$depth_mutations_pos" "$depth_mutations_all" > "$depth_mutations_table"

#===================================================================================================
# BUILD MARKDOWN FILE
#===================================================================================================

report_pdf.sh -i "$run_path"

#---------------------------------------------------------------------------------------------------

echo_log "${GREEN}Done${NC}"
