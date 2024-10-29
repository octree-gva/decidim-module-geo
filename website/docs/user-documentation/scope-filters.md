---
sidebar_position: 10
title: Scope Filter
description: Behaviour of the scope filter
---

# Scope filter

In Decidim, points are assigned to a scope in different ways: 

- by an administrator, specifing a scope for the component or the space
- by a user, while creating a meeting or a proposal
- by a automatic process, finding the right scope looking at the geo location (see [Automatic Scope](./automatic-scopes.md))

Decidim Geo filter points by scope, if participants filter scopes from the web plateform, or if they click on the shapes. 


**Only scopes linked to a geo-shape are available**<br />
If points are linked to a scope that do not belongs to a geo-friendly scope type, or is not linked to a shape won't be display as option to be filtered. 


**Empty scopes are not displayed**<br />
To avoid to filter something that have nothing, scopes have no points won't be propose in scope filter. 


**Scopes filter is not displayed if there is no scopes at all**<br />
The scope filter input is hidden if no scopes are available.


