#!/usr/bin/env python

import os
import argparse
import pandas as pd
import numpy as np
from Bio import SeqIO
pd.options.mode.chained_assignment = None


def is_complete(rundir,prefix):
    """
    Determine if a genome has passed the filters required to be marked as complete
    Return True/False and the number of unambiguous bases
    """
    
    genome_path = os.path.join(rundir,prefix+'.complete.fasta')
    if os.path.exists(genome_path):
        cons = list(SeqIO.parse(open(genome_path),"fasta"))[0]
        cons = list(cons.seq.upper())
        assert len(cons) == 29903
        ambig = cons.count('N')
        return(True,29903-ambig)
    else:
        partial_path = os.path.join(rundir,prefix+'.partial.fasta')
        assert os.path.exists(partial_path)
        cons = list(SeqIO.parse(open(partial_path),"fasta"))[0]
        cons = list(cons.seq.upper())
        assert len(cons) == 29903
        ambig = cons.count('N')
        return(False,29903-ambig)
    

def generate_postfilter_summary(rundir):
    """
    Generate a summary table of postfilter results
    """
    
    alldata = pd.DataFrame()
    
    # intialize lists
    runs = []
    samplenames = []
    barcodes = []
    alpha = []
    flags = []
    coverage = []
    status = []
    snps = []
    num_flagged = []
    
    # loop through the variant data files in the postfilter run directory
    for entry in os.scandir(rundir):
        if entry.path.endswith('variant_data.txt'):
            vardata = entry.path
            prefix = entry.path.split('.')[0].split('/')[-1]
            
            # get the flags for this sample
            var = pd.read_csv(vardata,sep='\t')
            printflag = []
            snp = []
            stat = []
            
            # get the basic data for this sample
            runs.append(var['run_id'].values[0])
            samplenames.append(var['sample'].values[0])
            barcodes.append(var['barcode'].values[0])
            
            # replace '.' empty values with np.nan
            #var = var.replace('.',np.nan)
            
            for pos in var.pos:
                tmp = var[var.pos==pos]
                tmp = tmp.replace('.',np.nan)
                data = tmp.to_dict('records')[0]
                
                # get all the flags (for status determination)
                # and get only flags to print
                
                # replace flags with abbreviated versions
                for key in ['depth_flag','ntc_flag','new_flag','sb_flag','key_flag']:
                    if not pd.isna(data[key]):
                        if 'depth' in data[key]:
                            data[key]='depth'
                        elif 'NTC' in data[key]:
                            data[key]='NTC'
                        elif 'nextstrain' in data[key]:
                            data[key]='new'
                        elif 'strand bias' in data[key]:
                            data[key]='SB'
                if any(not pd.isna(data[key]) for key in ['maf_flag','mixed_flag']):
                    data['maf_flag']='MAF'
                        
                # update illumina support to produce flags only if no/maybe/mixed
                data['ill']=np.nan
                if not pd.isna(data['illumina_support']):
                    if data['in_consensus'] and not data['illumina_support']=='yes':
                        data['ill']='ill'
                    elif data['in_consensus']==False and not data['illumina_support']=='no':
                        data['ill']='ill'
                
                # concatenate all flags together
                flags_to_join=['depth_flag','ntc_flag','vc_flag','maf_flag','sb_flag','key_flag','new_flag','ill']
                flag_data = {key: data[key] for key in flags_to_join}
                allflag = ', '.join([str(pos)+':'+str(x) for x in flag_data.values() if not pd.isna(x)])
                stat.append(data['status'])
                
                if not allflag=='':
                    printflag.append(allflag)
                
                if data['unambig']:
                    if pd.isna(data['vc_flag']):
                        snp.append(''.join([data['ref'],str(pos),data['alt']]))
                    else:
                        # values that mean this position is not actually a snp in the consensus
                        no_snp = ['mismatch(m)','mismatch(s)','mismatch(m+s)']
                        if any(mismatch_snp in data['vc_flag'] for mismatch_snp in no_snp)==False:
                            snp.append(''.join([data['ref'],str(pos),data['alt']]))
                            
                else:
                    snp.append(''.join([data['ref'],str(pos),'N']))
            
            # get the percent coverage for this sample
            complete,nt = is_complete(rundir,prefix)
            coverage.append('{:.2%}'.format(nt/29903.0))
            
            # get the status for this genome
            if not complete:
                status.append('No')
            elif 'Alarm' in stat:
                status.append('Maybe')
            elif 'Check' in stat:
                status.append('Yes*')
            else:
                status.append('Yes')
            
            # include sample in alpha group if it passes completeness threshold
            if complete:
                alpha.append('Yes')
            else:
                alpha.append('No')
                                    
            # only print flags for complete genomes
            if not complete:
                flags.append('see full output')
                snps.append('see full output')
                num_flagged.append(len(printflag))
            else:
                # make the flags look nice and add them
                
                if not printflag: # this will be an empty list if there are no flags
                    flags.append('')
                    num_flagged.append(0)
                    snps.append(', '.join(snp))
                else:
                    # join the flags
                    flagstr = ', '.join(printflag)
                    
                    # format the flags
                    flaglist=[item.split(":") for item in flagstr.split(", ")]
                    flagdict={}
                    
                    for key,val in flaglist:
                        flagdict.setdefault(key, []).append(val)
                    
                    flagstr='; '.join("{!s}={!r}".format(key,val) for (key,val) in flagdict.items())
                    flagstr=flagstr.replace('\'','')
                    
                    # add flags and counts to final list
                    num_flagged.append(len(flagdict))
                    flags.append(flagstr)
                    snps.append(', '.join(snp))
            
            # join this dataframe to all the others
            alldata = pd.concat([alldata,var],ignore_index=True)
    
    # make the dataframe
    df = pd.DataFrame({'Run':runs,'Sample':samplenames,'Barcode':barcodes,'Coverage':coverage,'Variants':snps,'Flags':flags,'Flagged Positions':num_flagged,'Alpha':alpha,'Status':status})
    df = df.sort_values(by='Sample')
    df.to_csv(os.path.join(rundir,'postfilt_summary.txt'),sep='\t',index=False)
    
    # output the large table
    # get a list of columns
    cols = list(alldata)
    cols.insert(0, cols.pop(cols.index('sample')))
    alldata = alldata.reindex(columns=cols)
    alldata.to_csv(os.path.join(rundir,'postfilt_all.txt'),sep='\t',index=False)
    
def parse_arguments():
   parser = argparse.ArgumentParser()
   parser.add_argument('--rundir', type=str, help='path postfilter results for a particular run')
   args = parser.parse_args()
   return(args)


if __name__ == "__main__":
    
    args = parse_arguments()
    generate_postfilter_summary(args.rundir)
