#!/bin/bash
source /home/user/idies/workspace/covid19/bashrc
conda activate jhu-ncov

# usage function
usage() {
        echo -e "usage: ${YELLOW}$0${NC} [options]"
        echo -e ""
        echo -e "OPTIONS:"
        echo -e "   -h      show this message"
        echo -e "   -i      /full/path/to/sequencing_run/artic-pipeline/4-draft-consensus"
        echo -e "   -d      /full/path/to/<control>nanopolish.primertrimmed.rg.sorted.del.depth"
        echo -e "   -b      /full/path/to/<control>nanopolish.primertrimmed.rg.sorted.bam"
        echo -e "   -v      /full/path/to/nextstrain_alignments.vcf"
        echo -e "   -c      /full/path/to/variant_case_definitions.csv"
        echo -e "   -r      /full/path/to/<reference>.fasta"
        echo -e "   -a      /full/path/to/amplicons"
        echo -e "   -m      /full/path/to/sequencing_run/manifest.txt"
        echo -e "   -n      name of control sample in manifest (Default = 'NTC')"
        echo -e ""
}

#---------------------------------------------------------------------------------------------------
control_name="NTC"
#---------------------------------------------------------------------------------------------------


# parse input arguments
while getopts "hi:d:b:v:c:r:a:m:n:" OPTION
do
       case $OPTION in
                h) usage; exit 1 ;;
                i) consensus_dir=$OPTARG ;;
                d) depthfile=$OPTARG ;;
                b) bamfile=$OPTARG ;;
                v) vcf_next=$OPTARG ;;
                c) case_defs=$OPTARG ;;
                r) reference=$OPTARG ;;
                a) amplicons=$OPTARG ;;
		m) manifest=$OPTARG ;;
		n) control_name=$OPTARG;;
                ?) usage; exit ;;
       esac
done

postfilter_dir="$(dirname ${consensus_dir})/5-post-filter"

# make and save output directory
if [[ ! -d "$postfilter_dir" ]]; then
        mkdir "$postfilter_dir"
fi

# save path to NTC depthfile and mpileup
ntc_depthfile="${depthfile}"
ntc_bamfile="${bamfile}"

# save path to nextstrain vcf
vcf_next="${vcf_next}"

# save path to case definitions
case_defs="${case_defs}"

# save path to reference genome
reference="${reference}"

# save path to amplicon sites file
amplicons="${amplicons}"


while read barcode name; do

	# loop through all NTC samples
	if [[  "$name" != "$control_name" ]]; then

		echo "SAMPLE $name: running vcf_postfilter.py"
		vcffile="${consensus_dir}/${name}_${barcode}.all_callers.combined.vcf"
		mpileup="${consensus_dir}/${name}_${barcode}.mpileup"
		depth="${consensus_dir}/${name}_${barcode}.nanopolish.primertrimmed.rg.sorted.del.depth"
		consensus="${consensus_dir}/${name}_${barcode}.nanopolish.consensus.fasta"

		# run script
		vcf_postfilter.py \
		--vcffile "$vcffile" \
		--mpileup "$mpileup" \
		--depthfile "$depth" \
		--consensus "$consensus" \
		--ntc-bamfile "$ntc_bamfile" \
		--ntc-depthfile "$ntc_depthfile" \
		--vcf-nextstrain "$vcf_next" \
		--case-defs "$case_defs" \
		--ref-genome "$reference" \
		--amplicons "$amplicons" \
		--ns-snp-threshold 2 \
		--outdir "$postfilter_dir" \
		--prefix "${name}_${barcode}"
	fi

done < "${manifest}"

