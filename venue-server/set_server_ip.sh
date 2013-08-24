# static IP: https://github.com/mitchellh/vagrant/issues/743

echo "Setting up a new static IP."
echo "Your SSH connection may hang - if so, kill it and log back in."

# ethernet
# sudo /sbin/ifconfig eth0 10.0.0.10 netmask 255.255.255.0 up
# sudo /sbin/route add default gw 10.0.0.1 eth0

# wifi
sudo /sbin/ifconfig eth1 10.0.0.10 netmask 255.255.255.0 up
sudo /sbin/route add default gw 10.0.0.1 eth1
