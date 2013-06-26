import sys
import datetime

f = open("notes.txt", 'a')
sys.argv.pop(0)
f.write(str(datetime.datetime.now()) + '\t' + ' '.join(sys.argv) + '\n')

