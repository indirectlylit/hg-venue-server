

# Setting up the dev environment #

1. Install [VirtualBox](https://www.virtualbox.org/). This is the virtualization software that will allow us to create any virtual machine we want and run it on our current machine at the same time as our main OS. We will use virtual machines to create web servers that will feed the web app directly to our browser.
    * On Linux, use `sudo apt-get install virtualbox` to install it.
    * On OS X and Windows, choose [the appropriate installer](https://www.virtualbox.org/wiki/Downloads) for your OS.
2. Install [Vagrant](http://www.vagrantup.com/). This is a helper software that will allow us to customize our virtual machines and create them on the fly on the command line.
    * On Linux, use `sudo apt-get install vagrant` to install it.
    * On OS X and Windows, choose [the most recent installer](http://downloads.vagrantup.com/) for your OS.
3. Make sure you have git installed. It should be a valid command when you type “git” in your terminal. This is the version control software that will allow us to manage our code.
    * On Linux, use `sudo apt-get install git`
    * On OS X and Windows, choose the [appropriate installer](http://git-scm.com/downloads).
4. Create a [BitBucket](https://bitbucket.org/) account, the place where our code is stored. Ask Devon to give you access to their repository.
5. Clone the repository to your computer. For example: `git clone https://bitbucket.org/pedalpower/venue-server.git`
6. In your terminal, make sure you are in the directory where you cloned the repository.



# Venue Server

This is our real-time visualization application. It takes data from our sensor network and renders it in real-time via a web server.


You'll need two terminal window in these directories:

* `network_coordinator`
* `venue_server`


## Starting up the server

In the `venue_server` terminal:

    > vagrant up

This may take a while the first time, as it is different from the docs_server virtual machine. We will need to manually start the server for this app. Once it is finished, you can ssh into the VM, which will be running in the background, by typing in:

    > vagrant ssh

Once you are on the virtual machine, you should see the terminal prompt change to `vagrant@precise32:~$`. You can now use this virtual machine environment to run the web server. The virtual machine (called the 'guest') will have a shared directory with the 'host' machine (your primary operating system). This is located at `/vagrant`, and the server's source code is at `/vagrant/src/`. Navigate there by typing:

    > cd /vagrant/src

Start the server with:

    > supervisor app.js


## Starting up logging script

To run the logger, you'll need `python`, `pip`, and some libraries installed.

First, in the `network_coordinator` terminal, check that `python` and `pip` are installed by running from the command line:

    > python --version
    > pip --version

Next, install the dependency libraries by running:

    > sudo pip install -r requirements.txt

Then, for a single sensor node without the MUX:

    > python logger.py -v

To log data to a file, run

    > python logger.py -l fileName.txt

To 'simulate' or play back a data file logged earlier, run

    > python logger.py -vs sampleData.txt

You should see a combination of **-**, **R**, and **F** characters at the beginning of every data packet (delimited by `{...}`). An 'R' means that the data is being fed to the server, and an 'F' means that it's being logged to a file.


For further help (e.g. on using with the MUX), type:

    > python logger.py -h


## Viewing the data


In your browser, navigate to [localhost:8080](localhost:8080)


## Shutting Down

In the `venue_server` console:

    > exit
    > vagrant halt

And to stop the logger script, type `^C` (`Ctrl-C`)





-----------


The Human Grid
All Rights Reserved

