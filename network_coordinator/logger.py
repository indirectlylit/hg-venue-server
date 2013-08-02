'''
@author: Devon Rueckner
The Human Grid
All Rights Reserved
'''

import serial
import serial.tools.list_ports
import socket
from datetime import datetime
import dateutil.parser
import time
import json
import sys
from optparse import OptionParser

TIME_FORMAT = "%Y-%m-%d %H:%M:%S.%f"


def parseCommandLineFlags():
    parser = OptionParser(usage='%prog [OPTIONS]')
    parser.add_option('-n', type='int', dest="number", default=0,
                    help='Number of mutexed serial ports to cycle over. Default: 0 (for a direct connection)')

    parser.add_option('-p', type='int', dest="period", default=100,
                    help='Milliseconds to wait between each data request. Default: 100')

    parser.add_option('-l', action="store_true", dest="log_file", default=False,
                    help='Log data to a file.')

    parser.add_option('-v', action="store_true", dest="verbose", default=False,
                    help='Verbose: output all data to the console')

    parser.add_option('-s', action="store", dest="sim_file",
                    help='Replay a logged file')

    options, args = parser.parse_args()
    if options.number > 4:
        print "More than four mutexed ports are not currently supported"
        dealWithIt()

    return options.number, options.period, options.log_file, options.sim_file, options.verbose


def getPort():
    """
    Searches for a port that looks like a serial-over-usb emulator
    """
    while True:
        ports = [p[0] for p in serial.tools.list_ports.grep("usb")]
        if len(ports):
            print "Setting serial port to {0}".format(ports[0])
            try:
                return serial.Serial(ports[0], 57600, timeout=0.2)
            except serial.serialutil.SerialException, e:
                print "Could not connect to serial port: {0}".format(e)
        else:
            print "No USB Serial port available."
        time.sleep(2)


class DataLink:
    def __init__(self, messageHandler):
        self._messageHandler = messageHandler

    def run(self):
        raise NotImplementedError

    def parseAndHandle(self, line):
        try:
            data = json.loads(line)
        except ValueError:
            print "!> ", line
        else:
            self._messageHandler(data)


class SerialDataLink(DataLink):
    def __init__(self, messageHandler, period=100):
        DataLink.__init__(self, messageHandler)
        self._serialPort = getPort()
        self._period = period

    def run(self):
        while True:
            self._serialPort.write(str('D'))
            line = self._serialPort.readline().strip()
            if not line:
                print "timeout"
            else:
                self.parseAndHandle(line)

            time.sleep(self._period / 1000.0)


class MUXedSerialDataLink(DataLink):

    MUX_BITS = (
            (False, False),
            (False, True),
            (True, False),
            (True, True),
        )

    def __init__(self, messageHandler, nMuxPorts, period=100):
        DataLink.__init__(self, messageHandler)
        self._serialPort = getPort()
        self._nMuxPorts = nMuxPorts
        self._period = period
        self._currentMuxPort = 0

        self._serialPort.setRTS(False)
        self._serialPort.setDTR(False)

    def _updateMux(self):
        self._currentMuxPort = (self._currentMuxPort + 1) % self._nMuxPorts
        self._serialPort.setRTS(MUXedSerialDataLink.MUX_BITS[self._currentMuxPort][0])
        self._serialPort.setDTR(MUXedSerialDataLink.MUX_BITS[self._currentMuxPort][1])

    def parseAndHandle(self, line):
        try:
            data = json.loads(line)
        except ValueError:
            print self._currentMuxPort, "\tNot JSON:", line
        else:
            data['address'] = self._currentMuxPort
            self._messageHandler(data)

    def run(self):
        while True:
            self._updateMux()

            self._serialPort.write(str('D'))
            line = self._serialPort.readline().strip()
            if not line:
                print self._currentMuxPort, "\ttimeout"
            else:
                self.parseAndHandle(line)

            time.sleep(self._period / (1000.0 * self._nMuxPorts))


class SimulatedDataLink(DataLink):
    def __init__(self, messageHandler, file):
        DataLink.__init__(self, messageHandler)
        self._file = file

    def run(self):
        while True:
            with open(self._file) as f:
                prevTime = None
                for line in f:
                    try:
                        data = json.loads(line)
                    except ValueError:
                        print self._currentMuxPort, "\tNot JSON:", line
                    else:

                        thisTime = dateutil.parser.parse(data['timestamp'])

                        if not prevTime:
                            prevTime = thisTime
                            self._messageHandler(data)
                            continue

                        delay = thisTime - prevTime
                        prevTime = thisTime
                        time.sleep(delay.total_seconds())
                        self._messageHandler(data)


class BasicLogger:

    def __init__(self, logToFile=False, verbose=False):

        self._fileHandle = None
        self._verbose = verbose
        if logToFile:
            fname = str(datetime.now()).replace(':', '_') + ".txt"
            self._fileHandle = open(fname, 'w')

    def handleData(self, data):

        data['timestamp'] = datetime.now(dateutil.tz.tzlocal()).isoformat()

        consolePrefix = ""

        if 'address' in data:
            consolePrefix += str(data['address'])
        else:
            data['address'] = 0

        line = json.dumps(data)

        if self._fileHandle:
            self._fileHandle.write(line + '\n')
            self._fileHandle.flush()

        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.sendto(line, ("10.0.0.10", 7777))

        if self._verbose:
            print line


def dealWithIt():
    sys.exit()


def main():
    numPorts, period, logToFile, simFile, verbose = parseCommandLineFlags()
    logger = BasicLogger(logToFile, verbose)

    if simFile:
        dataLink = SimulatedDataLink(logger.handleData, simFile)
    elif numPorts:
        dataLink = MUXedSerialDataLink(logger.handleData, numPorts, period)
    else:
        dataLink = SerialDataLink(logger.handleData, period)

    dataLink.run()


if __name__ == '__main__':
    main()
