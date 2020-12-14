#!/bin/bash

seq1="$1"
seq2="$2"

if [[ "${#seq1}" -ne "${#seq2}" ]]; then
	echo "Error: sequences must be the same length ("${#seq1}" != "${#seq2}")"
	exit
fi

printf "%s\t%s\n" "$seq1" "$seq2" | awk -F $'\t' '{
	for(i=1; i<=length($1); i++) {
		q1=substr($1,i,1);
		q2=substr($2,i,1);
		if(q1 != q2) {
			printf("%s%s%s\n", q1, i, q2);
		}
	}
}'
