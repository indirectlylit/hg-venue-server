#!/bin/bash

# installNodeModules.sh
#
# It is not possible to install Node packages to a shared directory in a VirtualBox VM [1].
# Therefore, we need to install the packages to a non-shared directory and then update the
# Node package search path. Dependencies are locked in with Shrinkwrap [2].
#
# Takes your source and target directories as arguments.
#  * Makes the target directory
#  * Copies over package.json and npm-shrinkwrap.json
#  * Sets the NODE_PATH global variable
#  * Installs required modules.
#
# [1] https://github.com/isaacs/npm/issues/2380
# [2] http://blog.nodejs.org/2012/02/27/managing-node-js-dependencies-with-shrinkwrap/

# Author: Devon Rueckner - no rights reserved


test -d $2 || mkdir $2
cd $2
test "$NODE_PATH" || echo NODE_PATH=$2/node_modules >> /etc/environment
cp $1/package.json ./package.json
cp $1/npm-shrinkwrap.json ./npm-shrinkwrap.json
npm install
