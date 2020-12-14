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
        echo -e "   -r      /full/path/to/<reference>.fasta"
        echo -e "   -a      /full/path/to/<reference_annotation>.gff"
        echo -e "   -m      /full/path/to/<sequencing_run>/manifest.txt"
        echo -e "   -n      name of control sample within run manifest (Default = 'NTC')"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------
control_name="NTC"
#---------------------------------------------------------------------------------------------------

# parse input arguments
while getopts "hi:r:a:m:n:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) postfilter_dir=$OPTARG ;;
                r) reference=$OPTARG ;;
                a) reference_annotation=$OPTARG ;;
                m) manifest=$OPTARG ;;
                n) control_name=$OPTARG ;;
                ?) usage; exit ;;
       esac
done

if [[ "$(uname -s)" = 'Linux' ]]; then
    BINDIR=$(dirname "$(readlink -f "$0" || echo "$(echo "$0" | sed -e 's,\\,/,g')")")
else
    BINDIR=$(dirname "$(readlink "$0" || echo "$(echo "$0" | sed -e 's,\\,/,g')")")
fi

# get known directory names
for i in `ls "$postfilter_dir"/*variant_data.txt`
do
    sample="${i##*/}"
    samplename="${sample%%.*}"
    echo "$i"
    echo "$samplename"

    consensusvcf="$postfilter_dir/$samplename.consensus.vcf"
    allvcf="$postfilter_dir/$samplename.allsnps.vcf"
    java -cp "$BINDIR/VariantValidator/src" TableToVcf table_file="$i" consensus_file="$consensusvcf" all_file="$allvcf"

    consensuscombinedvcf="$postfilter_dir/$samplename.consensus.combined.vcf"
    allcombinedvcf="$postfilter_dir/$samplename.allsnps.combined.vcf"
    java -cp "$BINDIR/VariantValidator/src" CombineVariants vcf_file="$consensusvcf" out_file="$consensuscombinedvcf" genome_file="$reference" gene_file="$reference_annotation"
    java -cp "$BINDIR/VariantValidator/src" CombineVariants vcf_file="$allvcf" out_file="$allcombinedvcf" genome_file="$reference" gene_file="$reference_annotation"
done


