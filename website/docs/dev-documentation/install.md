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

## Prerequisites
To install Decidim Geo, ensure you have the [PostGIS](https://postgis.net/) extension installed and enabled on your PostgreSQL database.

### Install Decidim Geo

Add the gem to your Gemfile
```
  gem 'decidim-decidim_geo', '~> 0.2.1'
```

Add javascripts libraries
```
    bundle exec rails decidim_geo:webpacker:install
```

Copy migrations and migrate
``` 
    bundle exec rails decidim_geo:install:migrations
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
### Tips for Installing [PostGIS](https://postgis.net/)
If you haven't installed PostGIS yet, follow these steps:

```sh
sudo apt update && sudo apt install postgis postgresql-14-postgis-3
```
Enable the PostGIS extension inside your PostgreSQL database:
```sql
CREATE EXTENSION postgis;
```

Modify your `docker-compose.yml` file to use PostGIS:
```yaml
pg:
  image: postgis/postgis:latest
  environment:
    POSTGRES_PASSWORD: postgres
Run the following command to add the required gem:
```sh
echo 'gem "activerecord-postgis-adapter"' >> Gemfile
```

Modify the file database.yml, changing the adapter to ``postgis``

Then, install the dependencies:
```sh
bundle install
```
