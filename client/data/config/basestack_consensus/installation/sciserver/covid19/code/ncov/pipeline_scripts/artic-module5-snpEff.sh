#!/bin/bash
source /home/user/idies/workspace/covid19/bashrc
conda activate jhu-ncov

# usage function
usage() {
        echo -e "usage: ${YELLOW}$0${NC} [options]"
        echo -e ""
        echo -e "OPTIONS:"
        echo -e "   -h      show this message"
        echo -e "   -i      /full/path/to/sequencing_run/artic-pipeline/5-postfilter"
        echo -e "   -c      /full/path/to/<snpEff_configuration>"
        echo -e "   -m      /full/path/to/manifest.txt"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:c:m:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) postfilter_dir=$OPTARG ;;
                c) snpEff_config=$OPTARG ;;
                m) manifest=$OPTARG ;;
                ?) usage; exit ;;
       esac
done

DBNAME="ncov"

annotate=$(which annotate_variants.sh)
if [[ -z "$annotate" ]]; then
	echo "Error: annotate_variants.sh is not in your path! Please place in your path before rerunning module."
	exit 1
fi

while read barcode name; do
    vcf="${postfilter_dir}"/"${name}"_"${barcode}".allsnps.combined.vcf
    if [[ -s "$vcf"  ]]; then
		"${annotate}" "${vcf}" "${snpEff_config}" "${DBNAME}" "${postfilter_dir}"
	else
		echo "File not found (snpEff not run): $vcf"
    fi
done < "$manifest"
echo "SnpEff completed on run ${postfilter_dir}"
echo "Making final reports on run ${postfilter_dir}"
find "${postfilter_dir}" -name "*_ann_report.txt" | head -n1 | while read f; do head -n1 "$f"; done > "${postfilter_dir}/final_snpEff_report.txt"
find "${postfilter_dir}" -name "*_ann_report.txt" | head -n1 | while read f; do head -n1 "$f"; done > "${postfilter_dir}/snpEff_report_with_Ns.txt"
find "${postfilter_dir}" -name "*_ann_report.txt" | while read f; do tail -n+2 "$f"; done | awk '$4 != "N" { print $0}' | sort -k2n,2 | uniq >> "${postfilter_dir}/final_snpEff_report.txt"
find "${postfilter_dir}" -name "*_ann_report.txt" | while read f; do tail -n+2 "$f"; done | awk '$4 == "N" { print $0}' | sort -k2n,2 | uniq >> "${postfilter_dir}/snpEff_report_with_Ns.txt"


