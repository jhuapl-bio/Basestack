#!/usr/bin/env python

import sys
import pandas as pd
sys.path.insert(0, "/home/user/idies/workspace/covid19/code/ncov/pipeline_scripts")
from samtools_funcs import collect_depths

# get path to bamfile on which to calculate depth
bamfile = sys.argv[1]
outfile = sys.argv[2]

depths = collect_depths(bamfile)
pos = range(1,len(depths)+1)
chrom = 'MN908947.3'

# create a data frame to output
df = pd.DataFrame({'chrom':chrom,'pos':pos,'depth':depths})

# save data frame to tab separated file
df.to_csv(outfile,sep='\t',index=False,header=False)
