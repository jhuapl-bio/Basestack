#!/bin/bash

fasta="$1"

sed 's/\r//g' "$fasta" | \
awk 'BEGIN{ FS="\t"; } {
    if(NR == 1) {
        printf("%s\n", $0);
    } else {
        if(substr($0,1,1) == ">") {
            printf("\n%s\n", $0);
        } else {
            printf("%s", $0);
        }
    }
} END { printf("\n"); }' | \
sed '$!N;s/\n/\t/' | awk -F$'\t' '{printf("%s\n%s\n", $1, toupper($2));}'
