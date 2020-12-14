#!/bin/bash
source /home/user/idies/workspace/covid19/bashrc
conda activate pangolin

# usage function
usage() {
        echo -e "usage: ${YELLOW}$0${NC} [options]"
        echo -e ""
        echo -e "OPTIONS:"
        echo -e "   -h      show this message"
        echo -e "   -i      /full/path/to/sequencing_run/artic-pipeline/5-postfilter"
        echo -e "   -d      /full/path/to/pangolin/data"
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
                d) pangolin_data=$OPTARG ;;
                m) manifest=$OPTARG ;;
                ?) usage; exit ;;
       esac
done

echo "Making Pangolin lineages for consensus sequences in ${postfilter_dir}"

while read barcode name; do
    cat "${postfilter_dir}"/"${name}"_"${barcode}".complete.fasta >> "${postfilter_dir}"/postfilt_consensus_all.fasta
done < "$manifest"

pangolin ${postfilter_dir}/postfilt_consensus_all.fasta -f -d ${pangolin_data} -o ${postfilter_dir} --tempdir $postfilter_dir
