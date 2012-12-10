# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::Config.run do |config|

	config.vm.box = "precise32"
	config.vm.box_url = "http://files.vagrantup.com/precise32.box"

	config.vm.provision :chef_solo do |chef|

		chef.cookbooks_path = "cookbooks"
		chef.add_recipe "apt"
		chef.add_recipe "build-essential"
		chef.add_recipe "git"
		chef.add_recipe "vim"
		chef.add_recipe "chef-curl"
		chef.add_recipe "nodejs"
		chef.add_recipe "redis::source"

		chef.json.merge!({
			:redis => {
				:bind => 			"0.0.0.0",
			}
		})

	end

	config.vm.provision :shell do |shell|
		shell.path = "installNodeModules.sh"
		shell.args = "/vagrant /usr/local/lib/node_app_modules"
	end

	config.vm.provision :shell, :inline => "npm install supervisor -g"

	config.vm.forward_port 8080, 8080
	config.vm.forward_port 8081, 8081
	config.vm.forward_port 6379, 6379

end
