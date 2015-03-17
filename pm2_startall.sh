#!/bin/bash
pm2 start bin/www
pm2 start bin/www_clientInterface
pm2 start app_sendAPNS
pm2 start app_sendSMS