#!/usr/bin/env bash

###

# Run snpeff annotations for variant calls

###

conda activate jhu-ncov

VCF=$1
CONFIG=$2
DBNAME=$3
OUT_DIR=$4

# CHECK 1: INPUT FILES

usage() {
    cat <<EOM
    Usage: $(basename $0) <vcf> <config> <dbname> <path to snpeff output dir>

EOM
    exit 0
}

[ -z $1 ] && { usage; }

JARPATH="/opt/conda/envs/jhu-ncov/share/snpeff-4.3.1t-4/"

VCF_BASE=$( basename ${VCF} ".vcf")
CONFIG_DIR=$( dirname ${CONFIG} )
CONFIG_DATA=${CONFIG_DIR}/data/
AA_DATA=${CONFIG_DIR}/amino_acid_codes.txt

if [[ ! -r "$CONFIG" ]]
then
        echo "$0: input $CONFIG not found"
        exit 1
fi

if [[ ! -r "$VCF" ]]
then
        echo "$0: input $VCF not found"
        exit 1
fi

# CHECK 2: LOAD ENVIRONMENT

if ! [[ -x "$(command -v snpEff)" ]]; then
  echo 'Error: snpEff is not installed.' >&2
  exit 1
fi

if ! [[ -x "$(command -v java)" ]]; then
  echo 'Error: java is not installed.' >&2
  exit 1
fi

# MAKE DIRS
java -Xmx4g -jar $JARPATH/snpEff.jar eff -c ${CONFIG} -dataDir ${CONFIG_DATA} ncov ${VCF} > ${OUT_DIR}/${VCF_BASE}_ann.vcf

if [[ ! -r "${OUT_DIR}/${VCF_BASE}_ann.vcf" ]]
then
        echo "$0: ERROR while running SnpEff"
        exit 1
fi

if grep -q "ERROR_" ${OUT_DIR}/${VCF_BASE}_ann.vcf; 
then
   error=$( grep -n "ERROR_" ${OUT_DIR}/${VCF_BASE}_ann.vcf )
   echo "$0: ERROR while running SnpEff ${error} "
   exit 1
fi
  
# Make report
# Report of all 3 letter amino acide codes
awk -F $'\t' '/^#/ { if ( $1 == "#CHROM" ) { new_fields="GENE\tANN\tAA_MUT" ; OFS="\t"; print $0"\t"new_fields ; next } ; print ; next } {
	n = split($8, a, ",");
	AA_MUT = "";
	for(i=1; i<=n; i++) {
		m = split(a[i], b, "|");
		if(AA_MUT == "") {
			GENE = b[4];
			ANN = b[2];
		}
		if(substr(b[11], 1, 2) == "p.") {
			if(AA_MUT != "") {
				if(AA_MUT != b[11]) {
					AA_MUT = gensub(/([A-Za-z]+[0-9]+)[\*A-Za-z]+/, "\\1X", "g", AA_MUT);
					ANN = "ambiguous";
				}
			} else {
				AA_MUT = gensub(/p\.(.*)/, "\\1", "g", b[11]);
				GENE = b[4];
				ANN = b[2];
			}
		}
	}
	printf("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n", $1, $2, $3, $4, $5, $6, $7, ".", GENE, ANN, AA_MUT);
}' "${OUT_DIR}/${VCF_BASE}_ann.vcf" > "${OUT_DIR}/${VCF_BASE}_ann_3letter_code.vcf"

# Report of all clean vcf
awk '/^#/ { if ( $1 == "#CHROM" ) { OFS="\t" ; print } else { print }}' ${OUT_DIR}/${VCF_BASE}_ann_3letter_code.vcf > ${OUT_DIR}/${VCF_BASE}_ann_clean.vcf 


### Modify this for all mutations
awk 'NR==FNR { a[$2] = $3 ; next } { FS="\t" ; if ( !/^#/ ) {  OFS="\t" ; last=$NF; gsub(/[0-9]*/,"",last) ; for(j=1;j<length(last);j+=3) { k=substr(last,j,3) ; gsub(k,a[k],$NF) } ; print }}' ${AA_DATA} ${OUT_DIR}/${VCF_BASE}_ann_3letter_code.vcf >> ${OUT_DIR}/${VCF_BASE}_ann_clean.vcf

# Tab demilited report
echo -e "#CHROM\tPOS\tREF\tALT\tGENE\tANN\tAA_MUT"  > ${OUT_DIR}/${VCF_BASE}_ann_report.txt 
awk '!/^#/{ print $1"\t"$2"\t"$4"\t"$5"\t"$9"\t"$10"\t"$11}' ${OUT_DIR}/${VCF_BASE}_ann_clean.vcf >> ${OUT_DIR}/${VCF_BASE}_ann_report.txt 


exit 0
## DONE
