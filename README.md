
# Venue Server

## Starting Up

You'll need two terminal window in these directories:

* `software/basic_logger`
* `software/venue_server`


In `venue_server`:

    > vagrant up
    > vagrant ssh
    > cd /vagrant/src
    > supervisor app.js


In `basic_logger`, for a single sensor node without the MUX:

    > python logger.py -v

For further help (e.g. on using with the MUX), type:

    > python logger.py -h

In your browser, navigate to [localhost:8080](localhost:8080)


## Shutting Down

In the `venue_server` console:

    > exit
    > vagrant halt

And to stop the logger script, type `^C` (`Ctrl-C`)





-----------


The Human Grid
All Rights Reserved

