#! /bin/sh
# /etc/init.d/venue-server
#

pushd ${HOME}/venue-server/venue-server

# Carry out specific functions when asked to by the system
case "$1" in
  start)
    echo "Starting venue-server"
    node src/app
    ;;
  *)
    echo "Usage: /etc/init.d/venue-server {start}"
    exit 1
    ;;
esac

popd

exit 0