# RestApi

1- Na linha de comandos:
    npm install express --save
    npm install cors --save
    npm install pg --save
    npm install nodemon --save

2- Verificar dos dados de acesso à BD no ficheiro routes.js

<Se quiseres usar o docker (nao é obrigatorio) segue estas instrucoes abaixo>
-a seguir para iniciar servidor docker:
    docker build -t node-web-app . 
    docker run -p 3000:3000 -d node-web-app

-Para inicializar o postgres no docker:
    docker-compose up

-A seguir entra no pgAdmin4 (http://192.168.99.100:5050/) e fazer login (username/pass = postgres)
    -adicionar servidor:
        localhost: 192.168.99.100;
        port: 5555;
        username/pass: postgres;
    
    -nos extensions ativar a extensao com nome "postgis";

    -copiar e colar o que está comentado no initdb/init.sql para criar e popular as tabelas


