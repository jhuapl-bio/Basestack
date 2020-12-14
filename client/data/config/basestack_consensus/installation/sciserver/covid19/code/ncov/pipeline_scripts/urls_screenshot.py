#!/usr/bin/env python

"""
#################
url_screenshots.py

Script to take screenshots from nextstrain urls

Author :  Srividya Ramakrishnan
Affliation : Johns Hopkins University
####################

Usage: 
url_screenshots.py [options] -l <list file of URLS> -o <output folder>
 
"""
from __future__ import (division, print_function, absolute_import,unicode_literals)
import sys, re
import argparse
from selenium import webdriver
import pandas as pd
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import os
from PIL import Image


## TODO
# Crop image to size
# Enable download of trees and svgs from nextstrain urls

#download_button="fa fa-download"
#driver.find_element_by_class(download_button).click

def get_screenshot(driver, url, filename , element):
    try:
       driver.get(url)
       dynamicElement = driver.find_element_by_id(element)
       driver.save_screenshot(filename + ".png")
       location = dynamicElement.location
       size = dynamicElement.size
       #print(location)
       #print(size)
       #im = Image.open(filename + ".png") # uses PIL library to open image in memory
       #left = location['x']
       #top = location['y']
       #right = location['x'] + size['width']
       #bottom = location['y'] + size['height']
       #im = im.crop((left, top, right, bottom)) # defines crop points
       #im.save(filename + ".png")
    except:
        raise

#wait_dict = { "tanglegram": "CardContentContainer", "map" : "map" , "tree" : "CardContentContainer"  }
wait_dict = { "tanglegram": "CardContentContainer", "map" : "CardContentContainer" , "tree" : "CardContentContainer"  }
 
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script to take screenshots from URLS")
    parser.add_argument("-l",dest="urls",type=str, required=True, help="List file containing URLs and screenshot names")
    parser.add_argument("-o",dest="out_p", type=str, default="screenshots", help="output directory name")
    args = parser.parse_args()
    urls = args.urls
    out_dir = args.out_p
    #views = pd.read_table(urls,header=None).to_dict()[0]
    views={}
    with open(urls, 'r') as f:
       for line in f:
           (l,u) = line.strip().split("\t")
           views[l] = u 
    f.close()
    #views = pd.read_table(urls,header=None).to_dict()
    #print(views)
    if not os.path.exists(out_dir):
       os.makedirs(out_dir)
     
    firefox_options = webdriver.FirefoxOptions()
    firefox_options.headless = True
    
    driver = webdriver.Firefox(options=firefox_options)
    count=0
    try:
       driver.set_window_size(1920, 1080)
       driver.implicitly_wait(200)
       for label in views:
           element = None
           url = views[label]
           out_file = out_dir + "/" + label
           count += 1
           for wait_code in wait_dict:
              if ( url.find(wait_code) == -1 ) :
                 pass
              else:
                 element = wait_dict[wait_code]
                 #print( wait_code + " : " + element  + " found  in the url : " + url )
                 break
           if element is not None :
              print("INFO : Taking Screenshot: " +  str(count) + " ; " +  label + ".png" )
              get_screenshot(driver,url,out_file,element)
           else:
              element = "CardContentContainer"
              print("INFO : Taking Screenshot: " +  str(count) + " ; " +  label + ".png" )
              get_screenshot(driver,url,out_file,element)
    except:
       raise    
    finally:
       driver.quit()
