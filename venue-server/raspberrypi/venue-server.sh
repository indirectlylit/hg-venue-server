#! /bin/sh
# /etc/init.d/venue-server
#

# Carry out specific functions when asked to by the system
case "$1" in
  start)
    echo "Starting venue-server"
    node /home/pi/venue-server/venue-server/src/app
    ;;
  *)
    echo "Usage: /etc/init.d/venue-server {start}"
    exit 1
    ;;
esac

exit 0