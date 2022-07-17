Install FFMPEG

sudo apt update
sudo apt install ffmpeg



sudo apt install -y erlang
sudo apt install -y rabbitmq-server
sudo systemctl start rabbitmq-server
sudo rabbitmq-plugins enable rabbitmq_management

<!-- Install https for localhost -->
mkcert -install
mkcert localhost


<!-- Pm2 -->
pm2 start yarn --interpreter bash --name api -- prod

