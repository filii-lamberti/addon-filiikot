ARG BUILD_FROM=hassioaddons/base:8.0.5
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Copy root filesystem
COPY rootfs/etc /etc/
COPY \
    rootfs/opt/filiikot/package.json \
    rootfs/opt/filiikot/yarn.lock \
    /opt/filiikot/

# Setup base
# hadolint ignore=DL3003
RUN \
    apk add --no-cache --virtual .build-dependencies \
        yarn=1.19.2-r0 \
    \
    && apk add --no-cache \
        nodejs=12.15.0-r1 \
    \
    && cd /opt/filiikot \
    \
    && yarn global add modclean \
    && yarn --production \
    \
    && modclean \
        --path /opt/filiikot \
        --no-progress \
        --keep-empty \
        --run \
    \
    && yarn global remove modclean \
    && yarn cache clean \
    \
    && apk del --no-cache --purge .build-dependencies

COPY rootfs/opt/filiikot/public /opt/filiikot/public/
COPY rootfs/opt/filiikot/app.js /opt/filiikot/

# Build arguments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_REF
ARG BUILD_VERSION

# Labels
LABEL \
    io.hass.name="Filiikot" \
    io.hass.description="A Filiikot add-on for Home Assistant" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="Jorim Tielemans <tielemans.jorim@gmail.com>" \
    org.label-schema.description="A Filiikot add-on for Home Assistant" \
    org.label-schema.build-date=${BUILD_DATE} \
    org.label-schema.name="Filiikot" \
    org.label-schema.schema-version="1.0" \
    org.label-schema.url="https://addons.community" \
    org.label-schema.usage="https://gitlab.com/filii-lamberti/addon-filiikot" \
    org.label-schema.vcs-ref=${BUILD_REF} \
    org.label-schema.vcs-url="https://gitlab.com/filii-lamberti/filii-addons" \
    org.label-schema.vendor="Filii Lamberti"
