#!/usr/bin/env python

import pandas as pd
import sys
    
def case_by_flags(data,maf_flag):
    """
    Assign case numbers to specific variant situations
    """
    
    # convert the maf_flag into a fraction
    maf_flag = maf_flag/100.0
    
    # situations that automatically lead to an alarm
    
    ## CASE 1
    if not pd.isna(data['depth_flag']):
        return(1)
    
    ## CASE 2
    if not pd.isna(data['ntc_flag']):
        return(2)
    
    ## CASE 3
    if data['illumina_support']=='maybe':
        return(3)
    
    ## CASE 4
    if not pd.isna(data['illumina_support']):
        if data['ont_AF']<maf_flag and data['illumina_AF']>(1-maf_flag):
            return(4)
        elif data['ont_AF']>(1-maf_flag) and data['illumina_AF']<maf_flag:
            return(4)
        
    ## CASE 5
    if data['ont_AF']<maf_flag and data['in_consensus']:
        return(5)
    
    ## CASE 6
    if data['ont_AF']>(1-maf_flag) and data['in_consensus']==False:
        return (6)
    
    
    # situtions with mixed frequency variants
    
    ## CASE 7
    if data['illumina_support']=='mixed':
        return(7)
    
    # at this point, illumina is yes/no/none
    
    if not pd.isna(data['mixed_flag']):
        
        ## CASE 8
        if data['in_consensus']==False and (not pd.isna(data['sb_flag'])) and (not data['illumina_support']=='yes'):
            return(8)
        
        ## CASE 9
        elif data['illumina_support']=='yes' and data['homopolymer'] and data['in_consensus']:
            return(9)
        
        ## CASE 10
        elif not pd.isna(data['illumina_support']):
            return(10)
        
        ## CASE 11
        else:
            other_allele_freq = float(int(data['ont_alleles'].split(':')[11])/data['ont_depth'])
            if (other_allele_freq-0.02 <= (1-data['ont_AF']) <= other_allele_freq+0.02) and data['homopolymer'] and data['in_consensus']:
                return(11)
        
            ## CASE 12
            else:
                return(12)
    
    # at this point we know the frequency is either <maf_flag or >(1-maf_flag)
    # and that the in consensus status matches the high/low status
    
    # specific situations for variants not seen before
    if not pd.isna(data['new_flag']):
        
        ## CASE 13
        if data['illumina_support']=='yes' and data['in_consensus']:
            return(13)
        
        ## CASE 14
        elif data['ont_AF']>0.9 and data['in_consensus']:
            return(14)
        
        ## CASE 15
        elif data['in_consensus']:
            return(15)
    
    # if there are no other worrisome flags
    # ignore low frequency variants and accept high frequency variants
    # remember we already know the consensus status matches the high/low status
    # we also know that illumina is not mixed or maybe, and that if there is illumina data, illumina status matches high/low status
    
    ## CASE 16
    if data['ont_AF']<maf_flag and data['unambig']:
        return(16)
    
    ## CASE 17
    if data['ont_AF']>(1-maf_flag) and data['unambig']:
        return(17)
    
    # at the end, ensure we catch all remaining consensus N variants
    
    ## CASE 18
    if data['unambig']==False:
        return(18)
    
    # all cases should be covered by this point
    # we should never get here
    sys.exit('you found a scenario not covered; please modify case_by_flags')


def status_by_case(variant_data,case_definitions,maf_flag):
    
    # load a text file with case definitions
    defs = pd.read_csv(case_definitions)
    
    # determine the case for this particular variant
    case = case_by_flags(variant_data,maf_flag)
    
    # get description and status for this case from definitions table
    current_case = defs[defs.case==case]
    description = current_case.description.values[0]
    status = current_case.status.values[0]
    
    return(case,description,status)