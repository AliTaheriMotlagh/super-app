# Architecture

## Frontend

- **Angular 22.2** standalone applications.
- **Nx 23.2** owns the monorepo graph, caching and affected builds.
- **Native Federation 22.2** is the micro-frontend layer. Nx 23 recommends Native Federation for new Angular micro-frontends.
- `super-shell` is the dynamic host.
- Nine domain remotes own the 44 product routes: commerce, finance, games, impact, life, local, media, social and utilities.
- `libs/contracts` is the typed product registry.
- `libs/micro-app-runtime` provides the small working MVP runtime shared by every remote.

## Backend

- **NestJS 12.1** API gateway plus domain microservices.
- Internal development transport is Nest TCP to keep the starter zero-infrastructure.
- PostgreSQL and Redis are included for the next persistence phase.
- Replace TCP with NATS/Kafka when asynchronous domain events are actually needed.

## Important boundary

A product idea is **not automatically a new microservice or deployable MFE**. It belongs to a domain boundary until scale, ownership or release cadence justifies extraction. This avoids 44 tiny distributed systems.
