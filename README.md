# Uberspace Backend Template

## Prepare Directory
- create app folder under `/home/user_name/apps`

## Prepare Service Config
- create config under `/home/user_name/etc/services.d/service_name.ini`

```
[program:service-name]
environment =
DB_HOST="localhost",
DB_PW="",
DB_USER="",
DB_NAME="",
JWT_SECRET="",
JWT_VALIDITY_DURATION=""

directory=/home/user_name/apps/app_folder
command=node main.js
autostart=yes
startsecs=30
```

## Prepare DB

```
createuser user_name -P

createdb --encoding=UTF8 --owner=user_name --template=template0 db_name
```

## Domain
- add domain: `uberspace web domain add domain_name`
- set up domain `uberspace web backend set domain_name/api --http --port port_number`