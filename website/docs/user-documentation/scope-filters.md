---
sidebar_position: 10
title: Scope Filter
description: Behavior of the scope filter
---

# Scope Filter

In Decidim, points can be assigned to a scope in various ways:

- By an administrator, specifying a scope for the component or the space
- By a participant, while creating a meeting or proposal
- By an automatic process that assigns a scope based on the geolocation (see [Automatic Scopes](./automatic-scopes.md))

Decidim Geo filters points by scope, either when participants filter scopes from the web platform or when they click on shapes.

**Only Scopes Linked to a Geo-Shape Are Available**  
If points are linked to a scope that does not belong to a geo-friendly scope type or is not linked to a shape, it will not appear as a filterable option.

**Empty Scopes Are Not Displayed**  
To avoid filtering empty scopes, only scopes with points are available in the scope filter.

**Scope Filter Is Hidden if No Scopes Are Available**  
The scope filter option is hidden if there are no available scopes.
