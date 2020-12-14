#!/bin/bash
source /home/user/idies/workspace/covid19/bashrc
conda activate nextstrain

# usage function
usage() {
        echo -e "usage: ${YELLOW}$0${NC} [options]"
        echo -e ""
        echo -e "OPTIONS:"
        echo -e "   -h      show this message"
        echo -e "   -i      /full/path/to/sequencing_run/artic-pipeline/5-postfilter"
        echo -e "   -r      /full/path/to/reference.gbk"
        echo -e "   -c      /full/path/to/clades.tsv"
        echo -e "   -m      /full/path/to/manifest.txt"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:d:m:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) postfilter_dir=$OPTARG ;;
                r) reference_gbk=$OPTARG ;;
                c) nextstrain_clades=$OPTARG ;;
                m) manifest=$OPTARG ;;
                ?) usage; exit ;;
       esac
done

assign_nextstrain_clades=$(which assign_clades.py)
if [[ -z "$assign_nextstrain_clades" ]]; then
        echo "Error: assign_clades.py is not in your path! Please place in your path before rerunning module."
        exit 1
fi

echo "Making Nextstrain clades for consensus sequences in ${postfilter_dir}"

if [[ ! -f "${postfilter_dir}"/postfilt_consensus_all.fasta ]]; then
   while read barcode name; do
       cat "${postfilter_dir}"/"${name}"_"${barcode}".complete.fasta >> "${postfilter_dir}"/postfilt_consensus_all.fasta
   done < "$manifest"
fi

"$assign_nextstrain_clades" --sequences "${postfilter_dir}"/postfilt_consensus_all.fasta --output "${postfilter_dir}"/nextstrain_clades.tsv --gbk ${reference_gbk} --clade ${nextstrain_clades}
