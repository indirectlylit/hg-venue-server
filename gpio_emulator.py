#!/usr/bin/env python

'''
Silly little emulator for wiringPi's GPIO utility:

  http://wiringpi.com/the-gpio-utility/

Devon Rueckner
The Human Grid
All Rights Reserved
'''


import argparse
import random
import sys



def mode(args):
    sys.exit()

def write(args):
    sys.exit()

def read(args):
    print 1
    # print random.randint(0, 1)
    sys.exit()


parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers()

parser_mode = subparsers.add_parser('mode')
parser_mode.add_argument('pin', type=int, help='Pin number')
parser_mode.add_argument('state', type=str, help='in/out/pwm/clock/up/down/tri')
parser_mode.set_defaults(func=mode)

parser_write = subparsers.add_parser('write')
parser_write.add_argument('pin', type=int, help='Pin number')
parser_write.add_argument('value', type=int, help='0/1')
parser_write.set_defaults(func=write)

parser_read = subparsers.add_parser('read')
parser_read.add_argument('pin', type=int, help='Pin number')
parser_read.set_defaults(func=read)

args = parser.parse_args()
args.func(args)

