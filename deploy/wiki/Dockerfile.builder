# Builder for the DTS wiki: polls GitHub, builds wiki/ with VitePress + Pagefind,
# and publishes releases atomically into /site (served read-only by wiki-web).
FROM node:24-alpine
RUN apk add --no-cache git openssh-client bash coreutils \
 && npm config set registry https://registry.npmmirror.com -g
COPY build-loop.sh /usr/local/bin/build-loop.sh
RUN chmod +x /usr/local/bin/build-loop.sh
ENTRYPOINT ["/usr/local/bin/build-loop.sh"]
