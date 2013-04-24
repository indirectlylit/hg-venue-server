
# Venue Server

This is our real-time visualization application. It takes data from our sensor network and renders it in real-time via a web server.


You'll need two terminal window in these directories:

* `software/basic_logger`
* `software/venue_server`


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

First, in the `basic_logger` terminal, check that `python` and `pip` are installed by running from the command line:

    > python --version
    > pip --version

Next, install the dependency libraries by running:

    > sudo pip install -r requirements.txt

Then, for a single sensor node without the MUX:

    > python logger.py -v

You should see a combination of '-', 'R', and 'F' characters at the beginning of every data packet (delimited by `{...}`). An 'R' means that the data is being fed to the server, and an 'F' means that it's being logged to a file.


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

