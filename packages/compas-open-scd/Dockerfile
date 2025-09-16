FROM public.ecr.aws/nginx/nginx:1.29.1

COPY nginx.conf /etc/nginx/nginx.conf
COPY build/. /usr/share/nginx/html

EXPOSE 8080

VOLUME /etc/nginx/
VOLUME /usr/share/nginx/html/public/cim
VOLUME /usr/share/nginx/html/public/conf
VOLUME /usr/share/nginx/html/public/nsdoc
