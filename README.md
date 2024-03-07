<h1 align="center"><img src="https://github.com/octree-gva/meta/blob/main/decidim/static/header.png?raw=true" alt="Decidim - Octree Participatory democracy on a robust and open source solution" /></h1>
<h4 align="center">
    <a href="https://octreegva.notion.site/Roadmap-Decidim-GEO-f191fcb9e220401f8135514a7bd41aab">Roadmap</a> |
    <a href="https://drive.google.com/file/d/1lfQJumDg0Ic-RZi-R3MM8frYtKN7PB_S/view?usp=sharing">Presentation</a> |
    <a href="https://github.com/octree-gva/decidim-module-geo/issues">Issues</a>  <br/>
    <a href="https://www.octree.ch">Octree</a> |
    <a href="https://octree.ch/en/contact-us/">Contact Us</a> |
    <a href="https://blog.octree.ch">Our Blog (FR)</a><br/><br/>
    <a href="https://decidim.org">Decidim</a> |
    <a href="https://docs.decidim.org/en/">Decidim Docs</a> |
    <a href="https://meta.decidim.org">Participatory Governance (meta decidim)</a><br/><br/>
    <a href="https://matrix.to/#/+decidim:matrix.org">Decidim Community (Matrix+Element.io)</a>
</h4>
<p align="center">
    <a href="https://participer.lausanne.ch">
        <img
            src="https://github.com/octree-gva/meta/blob/main/decidim/static/participer_lausanne/chip.png?raw=true"
            alt="Lausanne Participe — Une plateforme de participation pour imaginer et réaliser ensemble" />
    </a>
    <a href="https://opencollective.com/voca">
        <img
            src="https://github.com/octree-gva/meta/blob/main/decidim/static/opencollective_chip.png?raw=true"
            alt="Voca – Open-Source SaaS platform for Decidim" />
    </a>
</p>


# Decidim::Geo
Have you ever wondered to centralize all the participation in a map? Well, we do and that is the purpose of Decidim GEO. 
Participation on the map, means: 

* Overview participation: Be able to consult what happens where.
* Participate: Be able to pin points, select zones, etc. while participating

This project is its early stage, and has it is quiet ambicious, we open CO-FUNDING and setup a public Roadmap here: [https://octreegva.notion.site/Roadmap-Decidim-GEO-f191fcb9e220401f8135514a7bd41aab](https://octreegva.notion.site/Roadmap-Decidim-GEO-f191fcb9e220401f8135514a7bd41aab).

If you are curious on how it started, [we've made some slide to present the project](https://drive.google.com/file/d/1lfQJumDg0Ic-RZi-R3MM8frYtKN7PB_S/view?usp=sharing).


## How it works?

Postgis can load Shapefiles that can represents anything: neighbourghoods, cities, states, trees, public spaces.
We use this module to map a shape to an application zone, to be able to geo-references all the participatory processes of the platform. This way we can offer better consultation experience, and open new perspective for participation.

<img
    src="https://github.com/octree-gva/meta/blob/main/decidim/static/geo/admin.png?raw=true"
    alt="Administration of the GEO space" />
<img
    src="https://github.com/octree-gva/meta/blob/main/decidim/static/geo/consult.png?raw=true"
    alt="Administration of the GEO space" />


## Installation

Add this line to your application's Gemfile:

```ruby
gem "decidim-geo", git: "https://github.com/octree-gva/decidim-module-geo", branch: "main"
```
Update your database adapter to postgis: 
```
# config/database.yml
default: &default
  adapter: postgis
```

Update your `DATABASE_URL` environment with `postgis://`: 
```
DATABASE_URL="postgis://myuser:mypass@localhost/somedatabase"
```

And then execute:

```bash
bundle
bundle exec rails decidim_geo:install:migrations
bundle exec rails db:migrate

```

You will need a posgis database, at least version 14 to be able to do the migration.

## Testing

```
bundle exec rake test_app
```

## Local development
First, you need to run an empty database with a decidim dev container which runs nothing.
```
docker-compose down -v --remove-orphans
docker-compose up -d
```
Once created, you access the decidim container
```
# Get the id of the decidim dev container
docker ps --format {{.ID}} --filter=label=org.label-schema.name=dec
idim
# f16bd5314386
docker exec -it f16bd5314386 bash
```
You are now in bash, run manually `docker-entrypoint`.
```
# Will check your environment and do migrations if needed
docker-entrypoint
```
You are now ready to use your container in the way you want for development:

* Run a rails server: `bundle exec rails s -b 0.0.0.0`
* Have live-reload on your assets: `bin/webpack-dev-server`
* Execute tasks, like `bundle exec rails g migration AddSomeColumn`
* etc.
```
bundle exec rails s -b 0.0.0.0 # rails server
bin/webpack-dev-server
etc.
```

To stop everything, uses:
- `docker-compose down` to stop the containers
- `docker-compose down -v` to stop the containers and remove all previously saved data.

### Debugging
To debug something on the container:
1. Ensure `decidim-app` is running
```bash
    docker ps --all
#   CONTAINER ID   IMAGE                           COMMAND                  CREATED        STATUS        PORTS                                            NAMES
#   f16bd5314386   decidim-geo-development-app     "sleep infinity"   13 hours ago   Up 13 hours   0.0.0.0:3000->3000/tcp, 0.0.0.0:3035->3035/tcp   decidim-app <-------- THIS ONE
#   b56adf6404d8   decidim-geo-development-app     "bin/webpack-dev-ser…"   54 seconds ago   Up 46 seconds   0.0.0.0:3035->3035/tcp   decidim-webpacker                                       decidim-installer
#   bc1e912c3d8a   postgis/postgis:14-3.3-alpine   "docker-entrypoint.s…"   13 hours ago   Up 13 hours   0.0.0.0:5432->5432/tcp                           decidim-module-geo-pg-1
```

2. Run `docker exec -it decidim-app bash`
3. Run
    - `tail -f $ROOT/log/development.log` to **access logs**
    - `bundle exec rails restart` to **restart rails server AND keeps webpacker running**
    - `cd $ROOT` to access the `development_app`
    - `cd $ROOT/../decidim_module_geo` to access the module directory

### FAQ

**I can't see logs on the `decidim-app`?**
`decidim-app` runs here in development `webpacker-dev-server` AND a puma server, on the same container. 
Thus, we just run both, and only one will be displayed on STDOUT. To see puma log: `docker exec decidim-app tail -f /home/app/decidim/log/development.log`

**It takes for ever to pull the image?**
Try to pull from docker hub before doing your install script. `docker pull hfroger/decidim:0.26.8-dev` can help. 

**Why must I access to `127.0.0.1` and not `localhost`?**
`webpack-dev-server` run a websocket server on port 3535, and the rails server needs to connect to it. 
`localhost` won't make the trick, and you need to use a "real" ip, like `127.0.0.1`.  [More info](https://stackoverflow.com/a/54102318)

## Contributing

We are not yet ready for contributions, but we are working on a goood workflow

# Why it's not on MetaDecidim?
We think Decidim is already over complicated to install and setup. This module uses PosGis extensions on a postgres database, that can be hard to install. We block the proposal to metadecidim until these points are solved:

- We have stable release.
- We have feedbacks from participants that it is actually usefull.
- We have feedbacks from Decidim's admins that this is actually improving participation.
- Decidim run primarly on docker, with an updated documentation on installation. (We, at Octree is working on it for a while)

## License

This engine is distributed under the [GNU AFFERO GENERAL PUBLIC LICENSE](LICENSE-AGPLv3.txt)

<br /><br />
<p align="center">
    <img src="https://raw.githubusercontent.com/octree-gva/meta/main/decidim/static/octree_and_decidim.png" height="90" alt="Decidim Installation by Octree" />
</p>
