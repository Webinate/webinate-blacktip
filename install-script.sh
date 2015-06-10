#!/bin/bash -e
{ # this ensures the entire script is downloaded #

# Stops the execution of a script if a command or pipeline has an error
set -e

# Functiom that prints the latest stable version
version() {
  echo "0.0.12"
}

echo "cleaning up folder..."

# Remove existing folders if they exist
if [ -d "resources" ]; then
	rm resources -R
fi
if [ -d "templates" ]; then
	rm templates -R
fi


echo "Downloading latest version from github $(version)"

#download latest
wget https://github.com/MKHenson/webinate-blacktip/archive/v$(version).zip
unzip -o "v$(version).zip"

# Moves the server folder to the current directory
mv webinate-blacktip-$(version)/resources ./resources
mv webinate-blacktip-$(version)/templates ./templates

# Remove modepress-master
if [ -d "webinate-blacktip-$(version)" ]; then
	rm webinate-blacktip-$(version) -R
fi

# Remove the zip file
rm "v$(version).zip"

# All done
echo "Blacktip successfully installed :)"
exit
} # this ensures the entire script is downloaded #