


# Venue Server

This is network coordinator application. It takes data from our sensor network, combines it, and makes it available.


## Setting up the dev environment ##

### Virtual Machine ###

The application server should run on any OS: We leverage virtual machines to create a reproducible environment.

1. Install [VirtualBox](https://www.virtualbox.org/). This is the virtualization software that allows us easily set up and run a self-contained application server. It is known to work with [version 4.3.6](http://download.virtualbox.org/virtualbox/4.3.6/).
2. Install [Vagrant](http://www.vagrantup.com/). This wrapper software allows us to provision new virtual machines in a reproducible way. It is known to work with version 1.4.2.
3. Make sure you have git installed.
4. Clone this repository to your computer.
    * For example: `git clone git@bitbucket.org:pedalpower/venue-server.git`



## Starting up the server

Open a terminal in the `venue-server` sub-directory and run:

    > vagrant up

This may take a while the first time. Once it is finished, you can ssh into the VM, which will be running in the background, by typing in:

    > vagrant ssh

Once you are on the virtual machine, you should see the terminal prompt change to `vagrant@precise32:~$`. You can now use this virtual machine environment to run the web server. The VM (called the 'guest') will have a shared directory with the host machine (your primary OS). This is located at `/vagrant`, and the server's source code is at `/vagrant/src/`. Navigate there by typing:

    > cd /vagrant/src

Start the server with:

    > supervisor server.js


## Shutting Down

In the `venue-server` console:

    > exit
    > vagrant halt

And to stop the logger script, type `^C` (`Ctrl-C`)


## Installing on a Raspberry Pi


If you have a raspberry pi, there are two scripts to help get you from a blank 4G+ SD card to a super human-powered machine.

The first script is `install`, which can download and install an image (OSX only) to a blank SD card. We support raspbian, so after an SD card is plugged into your computer, run:

    > sudo ./raspberrypi/install http://files.velocix.com/c1410/images/raspbian/2013-05-25-wheezy-raspbian/2013-05-25-wheezy-raspbian.zip

Make sure to choose the right disk, because this can and will overwrite whatever is on there!

Now that raspbian is installed to the SD card, plug it in the Pi, and boot by plugging in a microusb cable.

There are a bunch of ways to connect to the pi. If it has a network address, try `ssh pi@raspberry.local` (password *raspberry*). Otherwise connect a keyboard and monitor, and login with username *pi*, password *raspberry*. A serial connection is also available through the GPIO.

Once the machine is booted, make sure the latest code is installed, then run the bootstrap script:

     > git clone bitbucket.org/pedalpowernyc/venue-server.git && cd venue-server
     > ./raspberrypi/bootstrap

This bootstrap script updates linux to the latest version, installs dependencies and libraries for the server, changes the hostname to `pedalpower-server` and ip to `10.0.0.10`. It will first test the network connection, then ask for a sudo password (should be the same as the pi password, `raspberry`). This takes a long time, and may look like its hanging, but just look for the 'OK' led on the board, which should be occasionally flashing green. The client software has this ip hard-coded, so if you change it be sure to change the config at the top of the `raspberrypi/bootstrap` script.

### GPIO Support

The Venue Server can output a square wave which is detected by the sensors. The round-trip time for the information to return helps us measure latency.

GPIO support is not yet baked into the boostrap script above and must be installed manually. After SSHing into the Pi, run:

    > git clone git://git.drogon.net/wiringPi && cd wiringPi
    > ./build

This will make the [gpio utility](http://wiringpi.com/the-gpio-utility/) available to the Venue Server.

## Developing locally, deploying on a Raspberry Pi

When developing, just dirty copy over the folder and restart the daemon.

    > scp -r ~/mycode/venue-server pi@10.0.0.10:~/venue-server
    > ssh pi@10.0.0.10 "sudo /etc/init.d/venuserver restart"

-----------


The Human Grid
All Rights Reserved

