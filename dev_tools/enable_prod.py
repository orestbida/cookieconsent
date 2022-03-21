import os, fnmatch
import sys
import fileinput
import glob
import subprocess
import shutil

abs_server_path = ''
closure_compiler_path = 'closure-compiler-v20211107.jar'
externs_path = 'externs.js'
excluded_files = []

# generates compressed .js files
def closure_compiler(folder_path, dist_jsfolder):

    # create js dist folder if not exists
    if not os.path.exists(dist_jsfolder):
            os.makedirs(dist_jsfolder)
            print (" created dist folder", dist_jsfolder+ "\n")

    # grab all files in that directory
    js_files = os.listdir(folder_path)  

    #compress each .js file
    for entry in js_files:
        if fnmatch.fnmatch(entry, "*.js"):
            # do not compress excluded files
            if not entry in excluded_files:
                print (" (compressing SIMPLE)   ",folder_path+entry)
                os.system('java -jar '+closure_compiler_path+' --js '+folder_path+entry+' --compilation_level SIMPLE_OPTIMIZATIONS --warning_level QUIET > '+dist_jsfolder+entry)

print ("\n--- CLOSURE COMPILER ------------------------ \n")
closure_compiler('../src/', '../dist/')
