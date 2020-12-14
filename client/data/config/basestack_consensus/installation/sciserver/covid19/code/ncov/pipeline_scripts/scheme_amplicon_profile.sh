#!/bin/bash

scheme="$1"

awk -F $'\t' 'BEGIN{
	printf "amplicon\tprimer_f_start\tprimer_f_stop\tunique_start\tunique_stop\tprimer_r_start\tprimer_r_stop\tmask_start\tmask_stop\n"
} {
	n = split($4, a, "_");
	amplicon = a[2];
	pool = $5;
	q_start = primer_start[amplicon][a[3]];
	q_stop = primer_stop[amplicon][a[3]];
	primer_start[amplicon][a[3]] = (q_start ? (q_start < $2 ? q_start : $2) : $2);
	primer_stop[amplicon][a[3]] = (q_stop ? (q_stop > $3 ? q_stop : $3) : $3);
} END {
	for(amplicon in primer_start) {
		start_f = primer_start[amplicon]["LEFT"]+1;
		stop_f = primer_stop[amplicon]["LEFT"];
		unique_start = (primer_start[amplicon-1]["RIGHT"] ? primer_stop[amplicon-1]["RIGHT"]+1 : primer_stop[amplicon]["LEFT"]+1);
		unique_stop = (primer_start[amplicon+1]["LEFT"] ? primer_start[amplicon+1]["LEFT"] : primer_start[amplicon]["RIGHT"]-1);
		start_r = primer_start[amplicon]["RIGHT"]+1;
		stop_r = primer_stop[amplicon]["RIGHT"];

		mask_start = (primer_start[amplicon-1]["RIGHT"] ? primer_start[amplicon-1]["RIGHT"]+1 : primer_stop[amplicon]["LEFT"]+1);
		mask_stop = (primer_stop[amplicon+1]["LEFT"] ? primer_stop[amplicon+1]["LEFT"] : primer_start[amplicon]["RIGHT"]-1);

		printf("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n", amplicon, start_f, stop_f, unique_start, unique_stop, start_r, stop_r, mask_start, mask_stop);
	}
}' "$1"
