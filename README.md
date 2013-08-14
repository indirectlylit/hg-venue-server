


# Venue Server

This is our real-time visualization application. It takes data from our sensor network or log files, feeds it through message channel, and renders it via a web server.


## Setting up the dev environment ##

### Virtual Machine ###

The application server should run on any OS: We leverage virtual machines to create a reproducible environment.

1. Install [VirtualBox](https://www.virtualbox.org/). This is the virtualization software that allows us easily set up and run a self-contained application server.
    * Note: VirtualBox 4.2.14 is [known not to work](https://github.com/mitchellh/vagrant/issues/1863) with Vagrant. You should download and install [version 4.2.12](http://download.virtualbox.org/virtualbox/4.2.12/) instead.
2. Install [Vagrant](http://www.vagrantup.com/). This wrapper software allows us to provision new virtual machines in a reproducible way.
3. Make sure you have git installed.
4. Clone this repository to your computer.
    * For example: `git clone git@bitbucket.org:pedalpower/venue-server.git`


### Python Dependencies ###

We also have a python script which currently runs outside of the VM on the host. To run this, you'll need Python and a few libraries installed. You can either install these directly to your system's Python packages, or use [virtualenv](http://www.virtualenv.org/en/latest/) to keep them isolated.

Check that `python` and [`pip`](http://www.pip-installer.org/en/latest/installing.html) are installed by running from the command line:

    > python --version
    > pip --version

Next, in the `network_coordinator` directory, install the dependency libraries by running the following. (sudo is not necessary if using virtualenv)

    > sudo pip install -r requirements.txt




## Starting up the server

Open a terminal in the `venue-server` sub-directory and run:

    > vagrant up

This may take a while the first time. Once it is finished, you can ssh into the VM, which will be running in the background, by typing in:

    > vagrant ssh

Once you are on the virtual machine, you should see the terminal prompt change to `vagrant@precise32:~$`. You can now use this virtual machine environment to run the web server. The VM (called the 'guest') will have a shared directory with the host machine (your primary OS). This is located at `/vagrant`, and the server's source code is at `/vagrant/src/`. Navigate there by typing:

    > cd /vagrant/src

Start the server with:

    > supervisor app.js


## Starting up logging script

Open another terminal on the host machine in the `network_coordinator` directory. Run the logger script with `-h` for options:

    > python logger.py -h

prints:

    Usage: logger.py [OPTIONS]

    Options:
      -h, --help   show this help message and exit
      -n NUMBER    Number of mutexed serial ports to cycle over. Default: 0 (for a
                   direct connection)
      -p PERIOD    Milliseconds to wait between each data request. Default: 100
      -l           Log data to a file.
      -v           Verbose: output all data to the console
      -s SIM_FILE  Replay a logged file


To 'simulate' or play back a data file logged earlier, run

    > python logger.py -vs sampleData.txt

For a single sensor node without the MUX:

    > python logger.py -v


You should see a combination of **-**, **R**, and **F** characters at the beginning of every data packet (delimited by `{...}`). An **R** means that the data is being fed to the server, and an **F** means that it's being logged to a file.



## Viewing the data

The logger script takes data either from the sensor network or a log file and streams it to the server. The server in turn accepts websocket connections from clients for display.

Once both the server and logger script are running, you can display the data: In your browser, navigate to [localhost:8080](localhost:8080)


## Shutting Down

In the `venue-server` console:

    > exit
    > vagrant halt

And to stop the logger script, type `^C` (`Ctrl-C`)


## Installing on real hardware

We have a convinience script here, `bootstrap`, which will turn a default raspbian-running raspberry pi into a super human-powered machine!

It grabs the latest dependencies for the project, export some init scripts, and setup the network. There are a few configurable options in case your network is different in the header of that script. Just edit it and run again.


-----------


The Human Grid
All Rights Reserved

