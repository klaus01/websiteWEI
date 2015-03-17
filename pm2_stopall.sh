#!/bin/bash
pm2 stop bin/www
pm2 stop bin/www_clientInterface
pm2 stop app_sendAPNS
pm2 stop app_sendSMS