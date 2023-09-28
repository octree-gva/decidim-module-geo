
FROM hfroger/decidim:0.26.8-dev as bundler
COPY . /home/decidim/decidim_module_geo
RUN cd /home/decidim/app \
    && bundle config set --global path "vendor" \
    && bundle config set --global without "" \
    && bundle config --global build.nokogiri --use-system-libraries \
    && bundle config --global build.charlock_holmes --with-icu-dir=/usr/include \
    && bundle config --global path "$BUNDLE_PATH" \
    # Remove spring from deps, that can have some issues with rgeo
    && echo "$(cat Gemfile | awk '!/spring/')" > Gemfile \
    # Add decidim-geo gem with a local path (bounded as volume)
    && echo "gem \"decidim-geo\", path: \"../decidim_module_geo\"" >> Gemfile \
    && bundle
    
FROM hfroger/decidim:0.26.8-dev
ENV NODE_ENV=development \
    RAILS_ENV=development \
    BUNDLE_WITHOUT=""
# Add locally the current rep in module, 
# This will be bound as volume later.
COPY . /home/decidim/decidim_module_geo
# Add app configuration for working in dev.
COPY ./.docker/config /home/decidim/app/config
COPY ./.docker/bin /home/decidim/app/bin

RUN bundle config set --global path "vendor" \
    && bundle config set --global without "" \
    && bundle config --global build.nokogiri --use-system-libraries \
    && bundle config --global build.charlock_holmes --with-icu-dir=/usr/include \
    && bundle config --global path "$BUNDLE_PATH"  \
    && apt-get upgrade -yq \
    && apt-get update -yq \
    && apt-get install -yq libgeos-dev 
RUN npm install -D webpack-dev-server \
  && cd /home/decidim/decidim_module_geo \
  && npm i
COPY --from=bundler /home/decidim/app/Gemfile /home/decidim/app/Gemfile
COPY --from=bundler /home/decidim/app/Gemfile.lock /home/decidim/app/Gemfile.lock
COPY --from=bundler /home/decidim/app/vendor /home/decidim/app/vendor