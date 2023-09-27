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
gem "decidim-geo"
```

And then execute:

```bash
bundle
bundle exec rails decidim-geo:install:migrations
bundle exec rails db:migrate
```

You will need a posgis database, at least version 14 to be able to do the migration.

## Testing

```
bundle exec rake test_app
```

## Local development
The docker-compose in this repository will run a development_app, 
binding the repository code in a module. 

```
rm -rf .migrations/
docker-compose down -v --remove-orphans
docker-compose build
docker-compose run --entrypoint "" --rm decidim-installer /home/decidim/app/bin/setup_development
docker-compose up
# Access your local environment [127.0.0.1:3000](http://127.0.0.1:3000)
#
# Your credentials
# /system
# email: `DECIDIM_SYSTEM_EMAIL` env . default: system@example.org
# password: `DECIDIM_SYSTEM_PASSWORD` env. default: decidim123456
# /admin
# email: `DECIDIM_SYSTEM_EMAIL` env . default: system@example.org
# password: `DECIDIM_SYSTEM_PASSWORD` env. default: decidim123456
```

This will run: 
- webpacker
- decidim with your module


If you want to debug something: 
```
    docker-compose run --entrypoint "" --rm decidim bash
```

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
