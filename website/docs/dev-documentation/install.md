---
sidebar_position: 1
title: Install Decidim Geo
description: Installation instructions
---

### Support Table
| Decidim Version | Supported?  |
|-----------------|-------------|
| 0.24            | no          |
| 0.26            | no          |
| 0.27            | yes         |
| 0.28            | coming soon |
| 0.29            | coming soon |

To install Decidim Geo, you need a [Posgis](https://postgis.net/) extension installed.

### Install Decidim Geo

Add the gem to your Gemfile
```
    gem "decidim-decidim_geo", version: "~> 0.2.6"
```

Add javascripts libraries
```
    bundle exec rails decidim_geo:webpacker:install
```

Copy migrations and migrate
``` 
    bundle exec rails decidim_geo:migration:install
    bundle exec rails db:migrate
```

### Check your installation
Check javascript libraries got installed
```
    # Should have javascript libraries placed in your package.json
    cat package.json | grep @maptiler/leaflet-maptilersdk
```
All migrations should be up
```
    bundle exec rails db:migrate:status | grep down
    # Should display nothing
```
Assets compilations should pass. 
``` 
    bundle exec rails assets:precompile
```
