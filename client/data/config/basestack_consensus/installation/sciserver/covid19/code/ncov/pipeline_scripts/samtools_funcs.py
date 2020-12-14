#!/usr/bin/env python

import pysam
import os

def collect_depths(bamfile):
    """
    Collect read depth of coverage per reference position in a BAM file
    Modified from: https://github.com/artic-network/fieldbioinformatics/ artic_make_depth_mask.py
    """
    
    # check the BAM file exists
    if not os.path.exists(bamfile):
        raise Exception("bamfile doesn't exist (%s)" % bamfile)

    # open the BAM file
    bamFile = pysam.AlignmentFile(bamfile, 'rb')

    # get the reference name from the bamfile
    refName = bamFile.get_reference_name(0)

    # create a depth vector to hold the depths at each reference position
    depths = [0] * bamFile.get_reference_length(refName)

    # generate the pileup
    for pileupcolumn in bamFile.pileup(refName, max_depth=10000, truncate=False, min_base_quality=0):

        # process the pileup column
        for pileupread in pileupcolumn.pileups:
            if not pileupread.is_refskip:
                depths[pileupcolumn.pos] += 1 #includes deletions

    # close file and return depth vector
    bamFile.close()
    return depths



def collect_position_pileup(bamfile,position):
    """
    Get full pileup at a single position
    Used to calculate depth and minor allele frequency at that position
    """
    
    # fix zero versus one based indexing
    position = position-1
    
    # check the BAM file exists
    if not os.path.exists(bamfile):
        raise Exception("bamfile doesn't exist (%s)" % bamfile)

    # open the BAM file
    bamFile = pysam.AlignmentFile(bamfile, 'rb')

    # get the reference name from the bamfile
    refName = bamFile.get_reference_name(0)
    
    # get pileup and depth at this position
    # pileup uses 0-based indexing, so need position-1 for actual genomic position
    pileup = []
    pileup.append(0)
    for pileupcolumn in bamFile.pileup(refName, start=position, stop=position+1, max_depth=10000, min_base_quality=13):
        for pileupread in pileupcolumn.pileups:
            if pileupcolumn.pos == position and not pileupread.is_refskip:
                pileup[0] += 1
                #if not pileupread.is_del:
                if not (pileupread.query_position) is None:
                    base=pileupread.alignment.query_sequence[pileupread.query_position]
                    pileup.append(base)
    
    bamFile.close()
    return pileup # first position is depth including deletions
