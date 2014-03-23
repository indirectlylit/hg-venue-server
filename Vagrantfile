# -*- mode: ruby -*-
# vi: set ft=ruby :

# The Human Grid
# All Rights Reserved

Vagrant.configure("2") do |config|

	config.vm.box = "precise32"
	config.vm.box_url = "http://files.vagrantup.com/precise32.box"

	## Uncomment this line to give the VM an IP locally
	# config.vm.network "private_network", ip: "10.0.0.10"

	## Uncomment these lines to give the VM an IP on the LAN
	# config.vm.network :public_network
	# config.vm.provision :shell, :path => "set_server_ip.sh"

	config.vm.provision :chef_solo do |chef|

		chef.cookbooks_path = "cookbooks"
		chef.add_recipe "apt"
		chef.add_recipe "build-essential"
		chef.add_recipe "git"
		chef.add_recipe "vim"
		chef.add_recipe "chef-curl"
		chef.add_recipe "nodejs"
		chef.add_recipe "avr-usb"

		chef.json.merge!({
			:nodejs => {
				:install_method => "package",
				:version => "0.10.22"
			}
		})
	end

	# install node dependencies
	config.vm.provision :shell, :inline => "cd /vagrant && npm install --no-bin-link"
	config.vm.provision :shell, :inline => "npm install -g supervisor bunyan"

	# install fish and make it the default shell
	config.vm.provision :shell, :inline => "apt-get -y install fish"
	config.vm.provision :shell, :inline => "usermod -s /usr/bin/fish vagrant"

	# make gpio an executable command
	config.vm.provision :shell, :inline => "chmod +x /vagrant/gpio_emulator.py"
	config.vm.provision :shell, :inline => "ln -sf /vagrant/gpio_emulator.py /usr/local/bin/gpio"

	# forwarded ports
	config.vm.network :forwarded_port, :host => 8080, :guest => 8080
	config.vm.network :forwarded_port, :host => 8081, :guest => 8081
	config.vm.network :forwarded_port, :host => 7777, :guest => 7777

end
