#!/usr/bin/env bash
 
##################
#Script to detect homopolymers in a sequence
##################
set -e 

FASTA=$1
OUT=$2

echo -e "#CHROM\tSTART\tEND\tNUC:OCCURENCES" > $OUT
tail -n+2 ${FASTA} | tr -d '\n' | grep -ob -E "(\w)\1{2,}" | sed 's/:/\t/g' | awk '{print "chr1\t"$1+1"\t"$1+length($2)"\t"substr($2,0,1)""length($2); }' | sort -k2,2n >> ${OUT}

header=$( head -n1 ${FASTA} | awk '{ print $1}' | sed 's/>//g' )
sed -i "s/chr1/${header}/g" ${OUT}
