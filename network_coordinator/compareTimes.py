"""
Check whether the 'millis' values reported by the microprocessor
are comparable to the timestamps inserted by the logger.

Sample usage with matplotlib:

vals = getStats(loadData("sampleData.txt"))
plt.plot(vals)
from scipy.stats.mstats import mquantiles
mquantiles(vals, [.95, .98, .995])

@author: Devon Rueckner
The Human Grid
All Rights Reserved
"""

from datetime import datetime
import json

TIME_FORMAT = "%Y-%m-%d %H:%M:%S.%f"


def getAddress(d):
    """
    given a datapoint, return the device's ID
    """
    return d['address'] if 'address' in d else 0


def getStats(dataList):

    prevVals = {}
    diffs = []

    for d in dataList:
        thisTime = datetime.strptime(d['timestamp'], TIME_FORMAT)
        thisMillis = d['millis']
        thisID = getAddress(d)

        if thisID not in prevVals:
            prevVals[thisID] = {}
            prevVals[thisID]["timestamp"] = thisTime
            prevVals[thisID]["millis"] = thisMillis
            continue

        timeStampDiff = thisTime - prevVals[thisID]["timestamp"]
        timeStampDiff = round(timeStampDiff.total_seconds() * 1000)
        millisDiff = thisMillis - prevVals[thisID]["millis"]

        diffs.append(abs(timeStampDiff - millisDiff))

        prevVals[thisID]["timestamp"] = thisTime
        prevVals[thisID]["millis"] = thisMillis

    return diffs


def loadData(fName):
    with open(fName) as f:
        data = []
        for line in f:
            try:
                d = json.loads(line)
            except ValueError:
                print "\tNot JSON:", line
            else:
                data.append(d)
        return data
