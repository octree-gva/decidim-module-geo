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

This project is its early stage, and has it is quiet ambicious, we open CO-FUNDING and setup a public Roadmap here: [https://octreegva.notion.site/Roadmap-Decidim-GEO-f191fcb9e220401f8135514a7bd41aab](https://octreegva.notion.site/Roadmap-Decidim-GEO-f191fcb9e220401f8135514a7bd41aab)

# Why it's not on MetaDecidim?
We think Decidim is already over complicated to install and setup. This module uses PosGis extensions on a postgres database, that can be hard to install. We block the proposal to metadecidim until these points are solved:

- We have stable release.
- We have feedbacks from participants that it is actually usefull.
- We have feedbacks from Decidim's admins that this is actually improving participation.
- Decidim run primarly on docker, with an updated documentation on installation. (We, at Octree is working on it for a while)

## Usage

Decidim GEO creates a GEO administrations

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

## Testing
```
bundle exec rake test_app
```

## Local development

Run a postgres database
```
docker-compose up -d
source .env.local
```

Run if you haven't already:
```bash
bundle
```

And then
```bash
bundle exec rake development_app
```

Setup and run the decidim development server
```
cd development_app
bin/rails db:migrate
bin/rails db:seed
bin/rails s
```
Access your local environment [localhost:3000](http://localhost:3000)

## Contributing

See [Decidim](https://github.com/decidim/decidim).

## License

This engine is distributed under the [GNU AFFERO GENERAL PUBLIC LICENSE](LICENSE-AGPLv3.txt)

<br /><br />
<p align="center">
    <img src="https://raw.githubusercontent.com/octree-gva/meta/main/decidim/static/octree_and_decidim.png" height="90" alt="Decidim Installation by Octree" />
</p>
