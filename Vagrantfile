# -*- mode: ruby -*-
# vi: set ft=ruby :

# The Human Grid
# All Rights Reserved

Vagrant.configure("2") do |config|

	config.vm.box = "precise32"
	config.vm.box_url = "http://files.vagrantup.com/precise32.box"

	config.vm.network "private_network", ip: "10.0.0.10"
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

	config.vm.provision :shell, :inline => "cd /vagrant && npm install --no-bin-link"
	config.vm.provision :shell, :inline => "npm install supervisor -g"


	config.vm.network :forwarded_port, :host => 8080, :guest => 8080
	config.vm.network :forwarded_port, :host => 8081, :guest => 8081
	config.vm.network :forwarded_port, :host => 6379, :guest => 6379
	config.vm.network :forwarded_port, :host => 7777, :guest => 7777

end
