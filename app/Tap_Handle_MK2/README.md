## Deploy developement enviroment
`./packer.sh deploy_dev` make sure that `./packer.sh` is executable.
This command will create the test page `taohandev.html`

## Deploy a working version
`./packer.sh deploy_min` make sure that `./packer.sh` is executable.
This command will minify all the code including dependcies and put everything into the `build` directory. It's content can be moved after the deployment ends.