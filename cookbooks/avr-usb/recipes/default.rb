#
# Cookbook Name:: avr-usb
# Recipe:: default
#
# Copyright 2013, Devon Rueckner
#
# MIT Licensed

# rules for allowing devices to be used by all users
template "/etc/udev/rules.d/avr-usb.rules" do
  source "avr-usb.rules"
end
